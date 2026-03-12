import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");
const API_URL = "https://wp.keploy.io/graphql";

async function fetchTechnologyPosts(apiUrl) {
  const all = [];
  let after = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = `
      query TechPosts($after: String) {
        posts(
          first: 50
          after: $after
          where: { orderby: { field: DATE, order: DESC }, categoryName: "technology" }
        ) {
          edges {
            node {
              slug
              modified
              date
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

    const posts = json?.data?.posts;
    const edges = posts?.edges || [];
    for (const edge of edges) {
      const node = edge?.node;
      if (!node?.slug) continue;
      all.push(node);
    }

    hasNextPage = Boolean(posts?.pageInfo?.hasNextPage);
    after = posts?.pageInfo?.endCursor || null;
  }

  return all;
}

function toIso(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().replace(".000Z", "+00:00");
}

function normalizeUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function extractExistingLocs(sitemapXml) {
  const matches = sitemapXml.match(/<loc>[^<]+<\/loc>/g) || [];
  return new Set(
    matches
      .map((m) => m.replace("<loc>", "").replace("</loc>", ""))
      .map((u) => normalizeUrl(u))
  );
}

function buildUrlEntries(nodes) {
  return nodes.map((node) => {
    const loc = normalizeUrl(`https://keploy.io/blog/technology/${node.slug}`);
    const lastmod = toIso(node.modified) || toIso(node.date) || "2026-03-11T21:50:59+00:00";
    return {
      loc,
      xml: `<url>\n<loc>${loc}</loc>\n<lastmod>${lastmod}</lastmod>\n<priority>0.51</priority>\n</url>\n`,
    };
  });
}

async function main() {
  const sitemapXml = await fs.readFile(SITEMAP_PATH, "utf8");
  if (!sitemapXml.includes("</urlset>")) {
    throw new Error("Invalid sitemap.xml: missing </urlset>");
  }

  const techPosts = await fetchTechnologyPosts(API_URL);
  const existingLocs = extractExistingLocs(sitemapXml);
  const entries = buildUrlEntries(techPosts);

  const uniqueByLoc = new Map();
  for (const entry of entries) {
    if (!uniqueByLoc.has(entry.loc)) uniqueByLoc.set(entry.loc, entry.xml);
  }

  const missingXml = [];
  for (const [loc, xml] of uniqueByLoc) {
    if (!existingLocs.has(loc)) missingXml.push(xml);
  }

  if (missingXml.length === 0) {
    console.log("No missing technology URLs. Sitemap unchanged.");
    return;
  }

  const updated = sitemapXml.replace("</urlset>", `${missingXml.join("")}</urlset>`);
  await fs.writeFile(SITEMAP_PATH, updated, "utf8");

  console.log(`Fetched technology posts: ${techPosts.length}`);
  console.log(`Added missing technology URLs: ${missingXml.length}`);
  console.log("Updated public/sitemap.xml");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
