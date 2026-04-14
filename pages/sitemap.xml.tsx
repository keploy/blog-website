import type { GetServerSideProps } from "next";
import { MAIN_SITE_URL } from "../lib/structured-data";

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
  errors?: { message: string }[];
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
    // WPGraphQL can return HTTP 200 with a top-level errors array (and
    // possibly partial data). Surface those as hard failures so the sitemap
    // is never silently rendered with missing or partial post lists.
    if (json.errors && json.errors.length > 0) {
      throw new Error(
        `WP GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`
      );
    }
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
    { loc: `${MAIN_SITE_URL}/blog`, lastmod: today, priority: "1.00" },
    { loc: `${MAIN_SITE_URL}/blog/community`, lastmod: today, priority: "0.80" },
    { loc: `${MAIN_SITE_URL}/blog/technology`, lastmod: today, priority: "0.80" },
  ];

  const postEntries: { loc: string; lastmod: string; priority: string }[] = [];
  const seen = new Set<string>();
  for (const post of posts) {
    const category = post.categories.edges
      .map((e) => e.node.slug)
      .find((slug) => VALID_CATEGORIES.has(slug));
    if (!category) continue;
    const loc = `${MAIN_SITE_URL}/blog/${category}/${post.slug}`;
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
  // Fall back to the static-only sitemap if WordPress is unreachable or
  // WPGraphQL returns errors — a minimal but valid sitemap is strictly
  // better than a 500 for crawler freshness, and the error still shows up
  // in Vercel function logs for alerting.
  let posts: PostNode[] = [];
  let degraded = false;
  try {
    posts = await fetchAllPosts();
  } catch (err) {
    degraded = true;
    const message = err instanceof Error ? err.message : String(err);
    // Structured log so on-call can diagnose from Vercel logs alone.
    console.error("[sitemap.xml] degraded: falling back to static entries", {
      endpoint: WP_GRAPHQL_ENDPOINT,
      envVarSet: Boolean(process.env.WORDPRESS_API_URL),
      error: message,
      nextSteps: [
        `1. curl -sS -X POST ${WP_GRAPHQL_ENDPOINT} -H 'Content-Type: application/json' -d '{"query":"{ __typename }"}' — confirms WPGraphQL is up and accepting queries`,
        "2. If the curl returns 5xx or hangs, check wp.keploy.io host status and the WPGraphQL plugin (WP admin → Plugins)",
        "3. If the curl returns 200 with an `errors` array, the Posts query changed — validate against the GraphiQL IDE in wp-admin",
        "4. If Vercel's WORDPRESS_API_URL env var is unset or wrong, the endpoint logged above will be the default https://wp.keploy.io/graphql — set it in Vercel project settings and redeploy",
        "5. Sitemap is served with a 5-minute edge cache during degradation (vs 24h on success), so it self-heals within ~5 min after WP recovers",
      ],
    });
  }
  const xml = buildSitemap(posts);

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Cache at the edge for 24h on success; only 5 min on degraded fallback so
  // a transient WP outage doesn't pin the stripped-down sitemap for a full day.
  // Bots hit this intermittently, so real WP GraphQL traffic is ~1 req/day per region.
  res.setHeader(
    "Cache-Control",
    degraded
      ? "public, s-maxage=300, stale-while-revalidate=300"
      : "public, s-maxage=86400, stale-while-revalidate=86400"
  );
  res.write(xml);
  res.end();
  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
