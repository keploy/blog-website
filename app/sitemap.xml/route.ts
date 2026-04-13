import { getAllPostsForSitemap } from "../../lib/api-server";
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
// After first generation: every request is served from CDN (<10ms, no Lambda invoked).
// After TTL expires: stale version served immediately, regeneration happens in background.
// If WordPress is down during regen: Vercel keeps serving the previous good version automatically.
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  try {
    // getAllPostsForSitemap() uses node:https directly (see lib/api-server.ts) to
    // bypass Next.js App Router's RSC fetch instrumentation, which causes Cloudflare
    // to return 502 HTML when global fetch() is used in this context.
    const allPostsResult = await getAllPostsForSitemap();
    const posts = adaptPostsForSitemap(allPostsResult);

    // Reject partial WordPress responses — ISR will not cache a thrown error,
    // so Vercel keeps serving the previous good cached version automatically.
    assertFullSitemap(posts);

    // Static routes get lastmod = newest post modification time,
    // so listing pages reflect when the freshest underlying content changed.
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
    // no-store prevents any downstream proxy from caching this degraded response,
    // so crawlers will retry on the next request once WordPress is back.
    return new Response(getStaticFallbackXml(), {
      status: 503,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "no-store",
      },
    });
  }
}
