import { getAllPosts } from "../../lib/api";
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

// ISR: Vercel caches this response in its persistent CDN edge cache for 1 hour.

// What this means in practice:
// After the first generation, every request is served from CDN (<10ms, no Lambda invoked).
// After TTL expires: Vercel immediately serves the stale cached version to the
//   requesting client, then regenerates in the background. The client never waits.
// If WordPress is down during background regen: Vercel silently keeps serving the
//   previous cached version. No fallback code needed, it is platform behaviour.
// The only case where no cached version exists is the very first request after deploy,
// or if generation has never succeeded (WordPress down on cold start). this can be ignored for a while but we can add
// a fix for this as well, we can explore prewarming, while the build itself, if we add a cronjob

// without prewarming: User → triggers ISR → waits 13s ❌
// prewarming: CI/CD → triggers ISR → warms cache ✅
// User → hits CDN → instant response ✅

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  try {
    // reuse the existing getAllPosts() paginator from lib/api.ts.
    // as of the pagination fix, this fetches ALL posts (not just the first 50).
    const allPostsResult = await getAllPosts();

    // convert getAllPosts() return shape into SitemapPost[] for the entry builders.
    const posts = adaptPostsForSitemap(allPostsResult);

    // reject partial wordpress responses before they replace a good cached version.
    // throws if fewer than 5 posts per category, ISR will not cache a thrown error,
    // so Vercel keeps serving the previous good cached version automatically.
    assertFullSitemap(posts);

    // static routes get lastmod = newest post modification time,
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
        // s-maxage instructs Vercel's CDN to cache for 1h (matches revalidate above).
        // stale-while-revalidate lets the CDN serve stale while regenerating in background.
        // max-age=0 ensures browsers always revalidate with the CDN rather than caching locally.
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
    // Vercel will keep serving the previous good cached version on the CDN.
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
