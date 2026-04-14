import type { GetServerSideProps } from "next";

const SITE_URL = "https://keploy.io";
const WP_GRAPHQL_ENDPOINT =
  process.env.WORDPRESS_API_URL || "https://wp.keploy.io/graphql";
const PAGE_SIZE = 100;
const VALID_CATEGORIES = new Set(["community", "technology"]);

type PostNode = {
  slug: string;
  modified: string;
  categories: { edges: { node: { slug: string } }[] };
};

type PostsPage = {
  data?: {
    posts?: {
      edges: { node: PostNode }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };
};

async function fetchAllPosts(): Promise<PostNode[]> {
  const all: PostNode[] = [];
  let cursor: string | null = null;

  while (true) {
    const query = `
      query SitemapPosts($after: String) {
        posts(first: ${PAGE_SIZE}, after: $after, where: { orderby: { field: MODIFIED, order: DESC } }) {
          edges { node { slug modified categories { edges { node { slug } } } } }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;
    const res = await fetch(WP_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { after: cursor } }),
    });
    if (!res.ok) {
      throw new Error(`WP GraphQL returned HTTP ${res.status}`);
    }
    const json = (await res.json()) as PostsPage;
    const page = json.data?.posts;
    if (!page) break;
    for (const edge of page.edges) all.push(edge.node);
    if (!page.pageInfo.hasNextPage) break;
    cursor = page.pageInfo.endCursor;
  }
  return all;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(posts: PostNode[]): string {
  const today = new Date().toISOString().split("T")[0];
  const staticEntries = [
    { loc: `${SITE_URL}/blog`, lastmod: today, priority: "1.00" },
    { loc: `${SITE_URL}/blog/community`, lastmod: today, priority: "0.80" },
    { loc: `${SITE_URL}/blog/technology`, lastmod: today, priority: "0.80" },
  ];

  const postEntries: { loc: string; lastmod: string; priority: string }[] = [];
  const seen = new Set<string>();
  for (const post of posts) {
    const category = post.categories.edges
      .map((e) => e.node.slug)
      .find((slug) => VALID_CATEGORIES.has(slug));
    if (!category) continue;
    const loc = `${SITE_URL}/blog/${category}/${post.slug}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    postEntries.push({
      loc,
      lastmod: post.modified.split("T")[0],
      priority: "0.64",
    });
  }

  const urls = [...staticEntries, ...postEntries]
    .map(
      ({ loc, lastmod, priority }) =>
        `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const posts = await fetchAllPosts();
  const xml = buildSitemap(posts);

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Cache at the edge for 24h; serve stale while revalidating for 24h more.
  // Bots hit this intermittently, so real WP GraphQL traffic is ~1 req/day per region.
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=86400"
  );
  res.write(xml);
  res.end();
  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
