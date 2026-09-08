import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PAGE_SIZE = 100;
const FETCH_TIMEOUT_MS = 15000;
const VALID_CATEGORIES = new Set(["community", "technology"]);
// Next.js basePath: next.config.js redirect `source`s omit it ("/community/…"),
// while vercel.json redirects and the emitted <loc>s carry it ("/blog/…").
const BASE_PATH = "/blog";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputPath = path.join(repoRoot, "public", "sitemap.xml");

const MAIN_SITE_URL = "https://keploy.io";

function requireWordPressEndpoint() {
  const endpoint = process.env.WORDPRESS_API_URL;
  if (!endpoint) {
    throw new Error("WORDPRESS_API_URL must be set to a valid WPGraphQL endpoint.");
  }
  try {
    new URL(endpoint);
  } catch {
    throw new Error("WORDPRESS_API_URL must be set to a valid WPGraphQL endpoint.");
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
            date
            categories {
              edges {
                node {
                  slug
                }
              }
            }
            featuredImage {
              node {
                sourceUrl
                altText
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { after: cursor } }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `WP GraphQL request timed out after ${FETCH_TIMEOUT_MS}ms.`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

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

function normalizePath(value) {
  if (typeof value !== "string" || value === "") return "";
  let out = value.split("#")[0].split("?")[0];
  if (!out.startsWith("/")) out = `/${out}`;
  if (out.length > 1 && out.endsWith("/")) out = out.slice(0, -1);
  return out;
}

// Build one exact-match source→destination path map from every redirect source
// the site actually serves (vercel.json + next.config.js). The sitemap must
// list the FINAL URL, not one that 301s — SEMrush flags redirecting <loc>s as
// "incorrect pages in sitemap". Only literal paths are used; any source with a
// regex/param token is skipped so we never rewrite a URL by accident.
async function loadRedirectMap() {
  const map = new Map();
  const add = (r, prefix = "") => {
    if (!r || typeof r.source !== "string" || typeof r.destination !== "string") return;
    // Conditional redirects (has/missing) only fire for some requests, so we
    // can't fold them into the sitemap unconditionally — skip them.
    if (r.has || r.missing) return;
    // Absolute destinations leave the site; normalizePath would mangle them into
    // "/blog/https:/…", so skip — the target isn't a same-site path to rewrite.
    if (/^https?:\/\//i.test(r.destination)) return;
    if (/[()*:?[\]+|]/.test(r.source)) return; // literal sources only
    // basePath:false means the rule isn't served under /blog, so don't prepend it.
    const usePrefix = r.basePath === false ? "" : prefix;
    const from = normalizePath(`${usePrefix}${r.source}`);
    const to = normalizePath(`${usePrefix}${r.destination}`);
    if (from && to && from !== to) map.set(from, to);
  };

  // vercel.json — sources already include the /blog basePath.
  try {
    const vercel = JSON.parse(
      await readFile(path.join(repoRoot, "vercel.json"), "utf8")
    );
    for (const r of vercel.redirects ?? []) add(r);
  } catch (error) {
    // Fail loud, don't warn-and-continue: an incomplete map silently emits
    // redirecting <loc>s — the exact SEO regression this script exists to
    // prevent — and sync-sitemap.yml auto-commits the output to main, so a
    // swallowed error would ship a degraded sitemap with no human in the loop.
    throw new Error(
      `[generate-sitemap] Could not read vercel.json redirects: ${error.message}`,
      { cause: error },
    );
  }

  // next.config.js redirects() — sources omit the basePath, so prepend it.
  try {
    const configUrl = pathToFileURL(path.join(repoRoot, "next.config.js")).href;
    const nextConfig = (await import(configUrl)).default;
    const list =
      typeof nextConfig?.redirects === "function" ? await nextConfig.redirects() : [];
    for (const r of list ?? []) add(r, BASE_PATH);
  } catch (error) {
    // Same rationale as the vercel.json load above — an unreadable config means
    // an incomplete redirect map, so fail rather than ship a degraded sitemap.
    throw new Error(
      `[generate-sitemap] Could not load next.config.js redirects: ${error.message}`,
      { cause: error },
    );
  }

  return map;
}

// Follow the redirect chain to its final path (cap hops + guard cycles).
function resolveLoc(loc, redirectMap, mainSiteUrl) {
  if (!loc.startsWith(mainSiteUrl)) return loc;
  let p = normalizePath(loc.slice(mainSiteUrl.length));
  const seen = new Set();
  let hops = 0;
  while (redirectMap.has(p) && hops < 10 && !seen.has(p)) {
    seen.add(p);
    p = redirectMap.get(p);
    hops += 1;
  }
  // If the map still has `p`, we bailed on the hop cap or a cycle rather than a
  // real terminus — the emitted <loc> may still 301. Surface it in the log.
  if (redirectMap.has(p)) {
    console.warn(
      `[generate-sitemap] redirect chain for ${loc} did not terminate (hop cap or cycle); emitting ${mainSiteUrl}${p}, which may still redirect.`,
    );
  }
  return `${mainSiteUrl}${p}`;
}

// The category segment of a resolved /blog/<category>/<slug> loc, or null. Used
// to bucket lastmod by where the post ACTUALLY lives after redirects, not where
// WordPress filed it (a /community post can 301 to /technology).
function categoryFromLoc(loc, mainSiteUrl) {
  const p = normalizePath(loc.startsWith(mainSiteUrl) ? loc.slice(mainSiteUrl.length) : loc);
  const m = p.match(/^\/blog\/([^/]+)\//);
  return m && VALID_CATEGORIES.has(m[1]) ? m[1] : null;
}

// The category of a resolved archive-root loc (/blog/<category>, no slug).
// categoryFromLoc intentionally only matches post URLs (/blog/<category>/<slug>);
// this covers the static roots so a redirected root buckets lastmod by where it
// actually lands, not where it started.
function archiveRootCategory(loc, mainSiteUrl) {
  const p = normalizePath(loc.startsWith(mainSiteUrl) ? loc.slice(mainSiteUrl.length) : loc);
  const m = p.match(/^\/blog\/([^/]+)\/?$/);
  return m && VALID_CATEGORIES.has(m[1]) ? m[1] : null;
}

function buildEntries(posts, mainSiteUrl, redirectMap = new Map()) {
  const today = new Date().toISOString().split("T")[0];

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
  const seen = new Set();

  for (const post of posts) {
    const categories = post.categories?.edges?.map((edge) => edge?.node?.slug).filter(Boolean) ?? [];
    const category = categories.find((slug) => VALID_CATEGORIES.has(slug));
    if (!category || !post.slug) {
      continue;
    }

    // Resolve through the site's own redirects so we never emit a URL that
    // 301s (e.g. a slug change, or a /community/ post moved to /technology/).
    const loc = resolveLoc(
      `${mainSiteUrl}/blog/${category}/${post.slug}`,
      redirectMap,
      mainSiteUrl,
    );
    if (seen.has(loc)) {
      continue;
    }

    seen.add(loc);

    // Prefer modified date; fall back to publish date; last resort is today.
    // Never assign latestOverall to a post — that would falsely signal a 2020
    // post was updated recently, eroding Google's trust in lastmod signals.
    const lastmod =
      normalizeLastmod(post.modified) ??
      normalizeLastmod(post.date) ??
      today;

    const imageUrl = post.featuredImage?.node?.sourceUrl ?? null;
    const imageAlt = post.featuredImage?.node?.altText ?? null;

    const entry = {
      loc,
      lastmod,
      priority: "0.70",
      ...(imageUrl ? { image: { loc: imageUrl, title: imageAlt || null } } : {}),
    };
    postEntries.push(entry);

    // Only track dates that came from WordPress (not our synthetic "today")
    // to avoid inflating latestOverall when many posts lack both modified and date.
    // A post modified today should still update latestByCategory/latestOverall.
    const isFromWordPress =
      normalizeLastmod(post.modified) !== null ||
      normalizeLastmod(post.date) !== null;
    if (isFromWordPress) {
      // Bucket by the RESOLVED category so a /community post that 301s to
      // /technology updates technology's lastmod, not community's.
      const resolvedCategory = categoryFromLoc(loc, mainSiteUrl) ?? category;
      if (!latestByCategory.has(resolvedCategory) || lastmod > latestByCategory.get(resolvedCategory)) {
        latestByCategory.set(resolvedCategory, lastmod);
      }
      if (!latestOverall || lastmod > latestOverall) {
        latestOverall = lastmod;
      }
    }
  }

  const fallbackLastmod = latestOverall ?? today;

  // Resolve static entries through the redirect map too — none redirect today,
  // so this is hardening against a future rule moving /blog/community etc.
  const staticSeen = new Set();
  const resolvedStaticEntries = [];
  for (const { loc, priority, category } of staticEntries) {
    const resolvedLoc = resolveLoc(loc, redirectMap, mainSiteUrl);
    // Dedup: a future redirect could collapse an archive root onto another
    // static entry or a post URL — each <loc> must appear once (the same
    // duplicate-<loc> failure N3 fixed for posts, one layer up).
    if (staticSeen.has(resolvedLoc) || seen.has(resolvedLoc)) {
      continue;
    }
    staticSeen.add(resolvedLoc);
    // Bucket lastmod by where the entry RESOLVES to, not where it started: a
    // redirected /blog/community must carry its destination's lastmod, not
    // community's. Fall back to the declared category, then fallbackLastmod.
    const resolvedCategory =
      categoryFromLoc(resolvedLoc, mainSiteUrl) ??
      archiveRootCategory(resolvedLoc, mainSiteUrl) ??
      category;
    resolvedStaticEntries.push({
      loc: resolvedLoc,
      priority,
      lastmod: resolvedCategory
        ? latestByCategory.get(resolvedCategory) ?? fallbackLastmod
        : fallbackLastmod,
    });
  }

  postEntries.sort((left, right) => left.loc.localeCompare(right.loc));
  return [...resolvedStaticEntries, ...postEntries];
}

function buildSitemapXml(entries) {
  const namespaces = [
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
  ].join("\n        ");

  const body = entries
    .map(({ loc, lastmod, priority, image }) => {
      let entry = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n    <priority>${priority}</priority>`;
      if (image) {
        entry += `\n    <image:image>\n      <image:loc>${escapeXml(image.loc)}</image:loc>`;
        if (image.title) {
          entry += `\n      <image:title>${escapeXml(image.title)}</image:title>`;
        }
        entry += `\n    </image:image>`;
      }
      entry += `\n  </url>`;
      return entry;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset ${namespaces}>\n${body}\n</urlset>\n`;
}

async function main() {
  const endpoint = requireWordPressEndpoint();
  const posts = await fetchAllPosts(endpoint);
  const redirectMap = await loadRedirectMap();
  const xml = buildSitemapXml(buildEntries(posts, MAIN_SITE_URL, redirectMap));

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, xml, "utf8");

  console.log(
    `Generated ${outputPath} with ${posts.length} WordPress posts as input.`
  );
}

// Only fetch WordPress + write the file when run directly (npm run
// generate:sitemap). Importing the module (e.g. to unit-test the redirect
// resolver) must not trigger a network build.
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((error) => {
    console.error("[generate-sitemap] Failed:", error);
    console.error(
      "[generate-sitemap] Next step: confirm WORDPRESS_API_URL is set, reachable, and returns valid WPGraphQL data."
    );
    process.exitCode = 1;
  });
}

export { normalizePath, loadRedirectMap, resolveLoc, buildEntries, categoryFromLoc };
