/**
 * Server-only API helpers.
 *
 * This module uses node:https directly instead of the global fetch() because
 * Next.js App Router's RSC context wraps fetch() with its own instrumentation
 * layer. That instrumented fetch sends headers that Cloudflare (in front of
 * wp.keploy.io) rejects with 502 HTML instead of JSON.
 *
 * node:https is a raw TCP connection — no Next.js middleware in the path —
 * identical to what curl or plain `node -e "fetch()"` sends.
 *
 * DO NOT import this file from client components. It uses node:https which
 * does not exist in the browser. All client-side API calls go through
 * lib/api.ts which uses the standard fetch() API.
 */
import "server-only";
import http from "node:http";
import https from "node:https";

function getApiUrl(): string {
  const url = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (!url) {
    throw new Error(
      "WordPress API URL is not configured. Set WORDPRESS_API_URL or NEXT_PUBLIC_WORDPRESS_API_URL."
    );
  }
  return url;
}

function fetchGraphQL(query: string, variables: Record<string, unknown> = {}): Promise<any> {
  const apiUrl = getApiUrl();
  const url = new URL(apiUrl);
  const body = JSON.stringify({ query, variables });

  // Use http for local/test endpoints (e.g. http://localhost:4000/graphql),
  // https for production. Determined by the protocol in the configured URL.
  const transport = url.protocol === "https:" ? https : http;
  const defaultPort = url.protocol === "https:" ? 443 : 80;

  // 25s per page request — well under Vercel's 30s ISR timeout and leaves
  // headroom for the pagination loop to complete across ~10 pages.
  const TIMEOUT_MS = 25_000;

  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        hostname: url.hostname,
        port: url.port || defaultPort,
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
          } catch {
            reject(
              new Error(
                `WordPress returned non-JSON (HTTP ${res.statusCode}): ${data.slice(0, 120)}`
              )
            );
          }
        });
      }
    );
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(
        new Error(`GraphQL request timed out after ${TIMEOUT_MS}ms — WordPress may be slow or unreachable`)
      );
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/**
 * Fetches all posts with only the fields needed for sitemap generation.
 * Uses the same cursor-based pagination as getAllPosts() in lib/api.ts but
 * requests a smaller field set (no title/excerpt/featuredImage) to reduce
 * payload size across the ~10 pagination pages.
 */
export async function getAllPostsForSitemap(): Promise<{ edges: any[] }> {
  let allEdges: any[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;

  while (hasNextPage) {
    const data = await fetchGraphQL(
      `
      query AllPostsForSitemap($after: String) {
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
    allEdges.push(...edges);
    hasNextPage = data?.posts?.pageInfo?.hasNextPage ?? false;
    endCursor = data?.posts?.pageInfo?.endCursor ?? null;
  }

  return { edges: allEdges };
}
