import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");
const API_URL = "https://wp.keploy.io/graphql";

function normalizeUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function toIso(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().replace(".000Z", "+00:00");
}

function extractExistingLocs(sitemapXml) {
  const matches = sitemapXml.match(/<loc>[^<]+<\/loc>/g) || [];
  return new Set(
    matches
      .map((m) => m.replace("<loc>", "").replace("</loc>", ""))
      .map((u) => normalizeUrl(u))
  );
}

async function fetchAllPosts(apiUrl) {
  let after = null;
  let hasNextPage = true;
  const posts = [];

  while (hasNextPage) {
    const query = `
      query SitemapBlogPosts($after: String) {
        posts(
          first: 100
          after: $after
          where: { orderby: { field: DATE, order: DESC } }
        ) {
          edges {
            node {
              slug
              modified
              date
              categories {
                edges {
                  node {
                    slug
                    name
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

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { after } }),
    });

    if (!response.ok) {
      throw new Error(`WPGraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(`WPGraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    const dataPosts = json?.data?.posts;
    for (const edge of dataPosts?.edges || []) {
      const node = edge?.node;
      if (!node?.slug) continue;
      posts.push(node);
    }

    hasNextPage = Boolean(dataPosts?.pageInfo?.hasNextPage);
    after = dataPosts?.pageInfo?.endCursor || null;
  }

  return posts;
}

function buildBlogUrl(node) {
  const categories = (node?.categories?.edges || [])
    .map((edge) => String(edge?.node?.slug || edge?.node?.name || "").toLowerCase())
    .filter(Boolean);

  if (categories.includes("technology")) {
    return `https://keploy.io/blog/technology/${node.slug}`;
  }
  if (categories.includes("community")) {
    return `https://keploy.io/blog/community/${node.slug}`;
  }
  return null;
}

function buildUrlEntries(posts) {
  return posts
    .map((node) => {
      const url = buildBlogUrl(node);
      if (!url) return null;
      const loc = normalizeUrl(url);
      const lastmod = toIso(node.modified) || toIso(node.date) || "2026-03-11T21:50:59+00:00";
      return {
        loc,
        lastmod,
        xml: `<url>\n<loc>${loc}</loc>\n<lastmod>${lastmod}</lastmod>\n<priority>0.51</priority>\n</url>\n`,
      };
    })
    .filter(Boolean);
}

async function main() {
  const sitemapXml = await fs.readFile(SITEMAP_PATH, "utf8");
  if (!sitemapXml.includes("</urlset>")) {
    throw new Error("Invalid sitemap.xml: missing </urlset>");
  }

  const allPosts = await fetchAllPosts(API_URL);
  const existingLocs = extractExistingLocs(sitemapXml);
  const entries = buildUrlEntries(allPosts);

  const uniqueEntries = new Map();
  for (const entry of entries) {
    if (!uniqueEntries.has(entry.loc)) uniqueEntries.set(entry.loc, entry);
  }

  const missingEntries = [];
  for (const [loc, entry] of uniqueEntries) {
    if (!existingLocs.has(loc)) missingEntries.push(entry);
  }

  if (missingEntries.length === 0) {
    console.log("No missing blog URLs. Sitemap unchanged.");
    return;
  }

  const updatedXml = sitemapXml.replace(
    "</urlset>",
    `${missingEntries.map((entry) => entry.xml).join("")}</urlset>`
  );
  await fs.writeFile(SITEMAP_PATH, updatedXml, "utf8");

  const techAdded = missingEntries.filter((e) => e.loc.includes("/blog/technology/")).length;
  const communityAdded = missingEntries.filter((e) => e.loc.includes("/blog/community/")).length;

  console.log(`Fetched posts from WP: ${allPosts.length}`);
  console.log(`Added missing blog URLs: ${missingEntries.length}`);
  console.log(`Added technology URLs: ${techAdded}`);
  console.log(`Added community URLs: ${communityAdded}`);
  console.log("Updated public/sitemap.xml");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
