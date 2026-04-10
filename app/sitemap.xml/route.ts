import https from "node:https";
import {
  adaptPostsForSitemap,
  assertFullSitemap,
  buildAuthorEntries,
  buildPostEntries,
  buildTagEntries,
  dedupeEntries,
  getLatestModified,
  getStaticFallbackXml,
  serializeSitemap,
  STATIC_ROUTES,
} from "../../lib/sitemap";

// ISR: Vercel caches this response in its CDN edge cache for 1 hour.
//
// After first generation: every request served from CDN (<10ms, no Lambda invoked).
// After TTL expires: stale version served immediately, regeneration happens in background.
// If WordPress is down during regen: Vercel keeps serving previous good version automatically.
// Cold-start / first request: mitigated by build-time pre-generation (see scripts/prewarm-sitemap.mjs)
// and post-deploy warming triggered by the Vercel deployment hook in GitHub Actions.
export const revalidate = 3600;

// ---------------------------------------------------------------------------
// fetchGraphQL — bypasses Next.js App Router's RSC fetch instrumentation.
//
// Problem: Next.js wraps global fetch() in RSC/Route Handler context with its
// own caching layer. This instrumented fetch sends headers that Cloudflare
// (in front of wp.keploy.io) interprets as invalid, returning 502 HTML instead
// of JSON — even though the same URL works fine from plain Node.js.
//
// Fix: use node:https directly. This is a raw TCP connection with no Next.js
// middleware in the path, identical to what curl or plain `node -e "fetch()"` sends.
// ---------------------------------------------------------------------------
function fetchGraphQL(query: string, variables: Record<string, unknown> = {}): Promise<any> {
  const apiUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!apiUrl) throw new Error("WORDPRESS_API_URL is not configured");

  const url = new URL(apiUrl);
  const body = JSON.stringify({ query, variables });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "User-Agent": "keploy-blog-sitemap/1.0",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.errors) reject(new Error(JSON.stringify(json.errors)));
            else resolve(json.data);
          } catch (e) {
            reject(new Error(`WordPress returned non-JSON (status ${res.statusCode}): ${data.slice(0, 120)}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Paginates through all posts using cursor-based pagination.
// Identical query to lib/api.ts getAllPosts() but using fetchGraphQL instead of fetch().
async function getAllPostsForSitemap() {
  let allEdges: any[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;

  while (hasNextPage) {
    const data = await fetchGraphQL(
      `
      query AllPosts($after: String) {
        posts(first: 50, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
          edges {
            node {
              slug
              modified
              ppmaAuthorName
              categories {
                edges {
                  node {
                    name
                    slug
                  }
                }
              }
              tags {
                edges {
                  node {
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
      `,
      { after: endCursor }
    );

    const edges = data?.posts?.edges ?? [];
    allEdges = [...allEdges, ...edges];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage ?? false;
    endCursor = data?.posts?.pageInfo?.endCursor ?? null;
  }

  return { edges: allEdges };
}

export async function GET(): Promise<Response> {
  try {
    const allPostsResult = await getAllPostsForSitemap();
    const posts = adaptPostsForSitemap(allPostsResult);

    // Reject partial WordPress responses — ISR will not cache a thrown error,
    // so Vercel keeps serving the previous good cached version automatically.
    assertFullSitemap(posts);

    // Static routes get lastmod = newest post modification time.
    const latestModified = getLatestModified(posts) ?? new Date().toISOString();
    const staticEntries = STATIC_ROUTES.map((r) => ({
      ...r,
      lastModified: latestModified,
    }));

    const entries = dedupeEntries([
      ...staticEntries,
      ...buildPostEntries(posts),
      ...buildAuthorEntries(posts),
      ...buildTagEntries(posts),
    ]);

    const xml = serializeSitemap(entries);

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        // s-maxage: CDN caches for 1h. stale-while-revalidate: serve stale while
        // regenerating in background. max-age=0: browsers always revalidate with CDN.
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error(
      "Sitemap generation failed — serving static-routes-only fallback. " +
        "Verify WORDPRESS_API_URL is reachable and WPGraphQL is responding.",
      error
    );

    // ISR does NOT cache non-2xx responses.
    // no-store prevents any downstream proxy from caching this degraded response.
    return new Response(getStaticFallbackXml(), {
      status: 503,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "no-store",
      },
    });
  }
}
