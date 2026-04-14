import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PAGE_SIZE = 100;
const VALID_CATEGORIES = new Set(["community", "technology"]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(repoRoot, "public", "sitemap.xml");

function requireMainSiteUrl() {
  const configuredSiteUrl = process.env.MAIN_SITE_URL ?? "https://keploy.io";
  if (!URL.canParse(configuredSiteUrl)) {
    throw new Error("MAIN_SITE_URL must be a valid absolute URL when provided.");
  }
  return new URL(configuredSiteUrl).origin;
}

function requireWordPressEndpoint() {
  const endpoint = process.env.WORDPRESS_API_URL;
  if (!endpoint || !URL.canParse(endpoint)) {
    throw new Error(
      "WORDPRESS_API_URL must be set to a valid WPGraphQL endpoint."
    );
  }
  return endpoint;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeLastmod(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return match[1];
  }

  return null;
}

async function fetchPostsPage(endpoint, cursor) {
  const query = `
    query SitemapPosts($after: String) {
      posts(
        first: ${PAGE_SIZE}
        after: $after
        where: { orderby: { field: MODIFIED, order: DESC } }
      ) {
        edges {
          node {
            slug
            modified
            categories {
              edges {
                node {
                  slug
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { after: cursor } }),
  });

  if (!response.ok) {
    throw new Error(`WP GraphQL returned HTTP ${response.status}`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(
      `WP GraphQL errors: ${json.errors.map((item) => item.message).join("; ")}`
    );
  }

  return json.data?.posts ?? null;
}

async function fetchAllPosts(endpoint) {
  const posts = [];
  let cursor = null;

  while (true) {
    const page = await fetchPostsPage(endpoint, cursor);
    if (!page) {
      break;
    }

    for (const edge of page.edges ?? []) {
      if (edge?.node) {
        posts.push(edge.node);
      }
    }

    if (!page.pageInfo?.hasNextPage) {
      break;
    }

    if (!page.pageInfo.endCursor) {
      throw new Error(
        "WP GraphQL indicated another posts page exists but did not return an endCursor."
      );
    }

    cursor = page.pageInfo.endCursor;
  }

  return posts;
}

function buildEntries(posts, mainSiteUrl) {
  const staticEntries = [
    { loc: `${mainSiteUrl}/blog`, priority: "1.00" },
    ...Array.from(VALID_CATEGORIES, (category) => ({
      loc: `${mainSiteUrl}/blog/${category}`,
      priority: "0.80",
      category,
    })),
  ];
  const postEntries = [];
  const latestByCategory = new Map();
  let latestOverall = null;
  const missingLastmodEntries = [];
  const seen = new Set();

  for (const post of posts) {
    const categories = post.categories?.edges?.map((edge) => edge?.node?.slug).filter(Boolean) ?? [];
    const category = categories.find((slug) => VALID_CATEGORIES.has(slug));
    if (!category || !post.slug) {
      continue;
    }

    const loc = `${mainSiteUrl}/blog/${category}/${post.slug}`;
    if (seen.has(loc)) {
      continue;
    }

    seen.add(loc);
    const lastmod = normalizeLastmod(post.modified);
    const entry = {
      loc,
      lastmod,
      priority: "0.64",
    };
    postEntries.push(entry);

    if (lastmod) {
      if (!latestByCategory.has(category) || lastmod > latestByCategory.get(category)) {
        latestByCategory.set(category, lastmod);
      }
      if (!latestOverall || lastmod > latestOverall) {
        latestOverall = lastmod;
      }
    } else {
      missingLastmodEntries.push(entry);
    }
  }

  const fallbackLastmod = latestOverall ?? new Date().toISOString().split("T")[0];
  for (const entry of missingLastmodEntries) {
    entry.lastmod = fallbackLastmod;
  }

  const resolvedStaticEntries = staticEntries.map(({ loc, priority, category }) => ({
    loc,
    priority,
    lastmod: category
      ? latestByCategory.get(category) ?? fallbackLastmod
      : fallbackLastmod,
  }));

  postEntries.sort((left, right) => left.loc.localeCompare(right.loc));
  return [...resolvedStaticEntries, ...postEntries];
}

function buildSitemapXml(entries) {
  const body = entries
    .map(
      ({ loc, lastmod, priority }) =>
        `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

async function main() {
  const mainSiteUrl = requireMainSiteUrl();
  const endpoint = requireWordPressEndpoint();
  const posts = await fetchAllPosts(endpoint);
  const xml = buildSitemapXml(buildEntries(posts, mainSiteUrl));

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, xml, "utf8");

  console.log(
    `Generated ${outputPath} with ${posts.length} WordPress posts as input.`
  );
}

main().catch((error) => {
  console.error("[generate-sitemap] Failed:", error);
  console.error(
    "[generate-sitemap] Next step: confirm WORDPRESS_API_URL is set, reachable, and returns WPGraphQL data; confirm MAIN_SITE_URL is a valid absolute URL when overridden."
  );
  process.exitCode = 1;
});
