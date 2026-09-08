/**
 * ISR revalidation policy.
 *
 * Freshness comes from on-demand revalidation (`/api/revalidate`, driven by a
 * WordPress publish/update webhook), NOT from time-based polling. The values
 * below are therefore safety nets that only fire if the webhook is misconfigured
 * or a delivery is dropped — they are not the primary freshness mechanism.
 *
 * Why this matters: these pages used to carry `revalidate: 10`/`60`. Every
 * expiry served a stale hit and fired a background regeneration, and each
 * regeneration is a full serverless invocation costing ~3.5s of WordPress
 * round-trips. Across ~520 posts under crawler traffic that was ~1.2M renders
 * and 2,224 GB-Hrs of function duration per billing period, re-fetching content
 * that changes a few times a week.
 *
 * Keep these values LARGE. If content feels stale, fix the webhook — do not
 * lower these numbers.
 */

/** Safety net for content pages. Real updates arrive via the webhook. */
export const REVALIDATE_CONTENT = 86400 // 24h

/**
 * Must mirror `basePath` in next.config.js.
 *
 * `res.revalidate(path)` is not a route lookup — on Vercel it performs a real
 * `fetch('https://' + host + path)` against the deployment (see
 * next/dist/server/api-utils/node/api-resolver.js). So the path has to be the
 * public URL path *including* the basePath, or every revalidation silently
 * 404s. `tests/lib/isr.test.ts` asserts this stays in sync with next.config.js.
 */
export const BASE_PATH = '/blog'

/** Public URL path for a post, ready to hand to `res.revalidate()`. */
export function postPath(category: string, slug: string) {
  return `${BASE_PATH}/${category}/${slug}`
}

/**
 * Genuine "this post does not exist" responses.
 *
 * Must stay large: a short TTL here lets bot-sprayed URLs re-render on every
 * expiry, turning random 404 traffic into unbounded function duration. A slug
 * that doesn't exist now will still not exist in a minute, and a newly
 * published post arrives via the webhook rather than by expiry.
 */
export const REVALIDATE_NOT_FOUND = 86400 // 24h

/**
 * Degraded responses caused by WordPress being unreachable — NOT by the
 * content genuinely being absent.
 *
 * Deliberately short. These pages must self-heal quickly once WP recovers,
 * otherwise a momentary blip during regeneration would pin a real post as a
 * 404 for a full day. The cost is bounded because it only applies to pages
 * that actually errored, not to the ~520 healthy ones.
 */
export const REVALIDATE_ERROR = 60 // 1m
