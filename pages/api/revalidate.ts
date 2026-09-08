import { createHash, timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { BASE_PATH, postPath } from "../../lib/isr";
import { sanitizeAuthorSlug } from "../../utils/sanitizeAuthorSlug";

/**
 * On-demand ISR — the blog's primary freshness mechanism.
 *
 * WordPress calls this on publish/update/delete and we regenerate exactly the
 * affected pages. That replaces time-based revalidation, which was regenerating
 * every post every 10-60s regardless of whether anything had changed (~1.2M
 * wasted renders and 2,224 GB-Hrs per billing period). See lib/isr.ts.
 *
 * Because every page now sits behind a 24h safety-net TTL, anything NOT
 * revalidated here stays stale for up to a day. So this must cover every page
 * type a publish can affect — post, listings, search indexes, tag and author
 * pages — not just the post itself.
 *
 * Setup: set REVALIDATE_SECRET in the Vercel project, then install the
 * companion mu-plugin on wp.keploy.io (docs/on-demand-revalidation.md).
 */

/**
 * Each target is a full blocking page render. The default function timeout is
 * too tight for a fan-out of ~10 against a slow WordPress, and the mu-plugin
 * fires non-blocking so a timeout would fail silently.
 */
export const maxDuration = 60;

const CATEGORIES = ["community", "technology"];

/** Bounds the fan-out an authenticated caller can request in one POST. */
const MAX_EXPLICIT_PATHS = 50;
const MAX_TAGS = 20;

/** How many regenerations to run at once. Keeps us inside maxDuration without
 *  stampeding WordPress with a burst of concurrent renders. */
const CONCURRENCY = 4;

/**
 * Constant-time secret comparison.
 *
 * Hashing first gives both sides a fixed 32-byte length, so timingSafeEqual
 * never throws on a length mismatch and the comparison leaks nothing about
 * the expected secret's length.
 */
function secretMatches(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * Sanitize one URL path segment (slug, tag name, author name).
 *
 * Rejects anything that could escape its segment and returns it percent-encoded
 * so tag names containing spaces still resolve. Returns null if unusable.
 */
function safeSegment(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "." || trimmed === "..") return null;
  if (/[\/\\]/.test(trimmed)) return null;
  return encodeURIComponent(trimmed);
}

/** Run tasks with a bounded number in flight. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await task(items[index]);
    }
  });

  await Promise.all(workers);
  return results;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Never cache this response — vercel.json also pins no-store on this route.
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    // Fail closed: without a configured secret this endpoint would let anyone
    // force unbounded regeneration, which is the exact cost we're removing.
    console.error("/api/revalidate called but REVALIDATE_SECRET is not set");
    return res.status(500).json({ error: "Revalidation is not configured" });
  }

  const provided = req.headers["x-revalidate-secret"];
  if (typeof provided !== "string" || !secretMatches(provided, expected)) {
    return res.status(401).json({ error: "Invalid secret" });
  }

  const {
    slug,
    category,
    tags,
    author,
    paths: explicitPaths,
  } = (req.body ?? {}) as {
    slug?: string;
    category?: string;
    tags?: string[];
    author?: string;
    paths?: string[];
  };

  const targets = new Set<string>();

  if (Array.isArray(explicitPaths)) {
    for (const path of explicitPaths.slice(0, MAX_EXPLICIT_PATHS)) {
      // Only ever revalidate our own pages — never let the caller aim this at
      // an arbitrary URL — and never let a path climb out of the basePath.
      if (
        typeof path === "string" &&
        path.startsWith(`${BASE_PATH}/`) &&
        !path.includes("..") &&
        !path.includes("//")
      ) {
        targets.add(path);
      }
    }
  }

  const safeSlug = safeSegment(slug);
  if (safeSlug) {
    if (typeof category === "string" && CATEGORIES.includes(category)) {
      targets.add(postPath(category, safeSlug));
    } else {
      // Category unknown or changed — a post can move between the two, and the
      // old URL needs regenerating so it starts serving its 301.
      for (const c of CATEGORIES) targets.add(postPath(c, safeSlug));
    }
  }

  if (targets.size === 0) {
    return res.status(400).json({ error: "Provide { slug, category } or { paths }" });
  }

  // A publish changes every surface that lists or indexes the post. All of
  // these sit behind the 24h safety net, so if they aren't refreshed here the
  // new post simply won't be findable until tomorrow.
  targets.add(BASE_PATH);
  for (const c of CATEGORIES) targets.add(`${BASE_PATH}/${c}`);
  targets.add(`${BASE_PATH}/search`);
  targets.add(`${BASE_PATH}/community/search`);
  targets.add(`${BASE_PATH}/tag`);
  targets.add(`${BASE_PATH}/authors`);

  // Tag pages are keyed by tag NAME (see pages/tag/[slug].tsx getStaticPaths).
  if (Array.isArray(tags)) {
    for (const tag of tags.slice(0, MAX_TAGS)) {
      const safeTag = safeSegment(tag);
      if (safeTag) targets.add(`${BASE_PATH}/tag/${safeTag}`);
    }
  }

  // Author pages are keyed by sanitizeAuthorSlug(name), not the raw name, so
  // sanitize with the same helper getStaticPaths uses or the path won't match.
  if (typeof author === "string" && author.trim()) {
    const safeAuthor = safeSegment(sanitizeAuthorSlug(author));
    if (safeAuthor) targets.add(`${BASE_PATH}/authors/${safeAuthor}`);
  }

  // Revalidate independently so one bad path can't drop the rest. A path that
  // legitimately 404s (e.g. the category the post is NOT in) is reported, not
  // treated as a failure of the whole request.
  const results = await mapWithConcurrency(
    Array.from(targets),
    CONCURRENCY,
    async (path) => {
      try {
        await res.revalidate(path);
        return { path, revalidated: true };
      } catch (error: any) {
        return { path, revalidated: false, reason: error?.message ?? String(error) };
      }
    }
  );

  const failed = results.filter((r) => !r.revalidated);
  if (failed.length === results.length) {
    console.error("/api/revalidate: every path failed", failed);
    return res.status(500).json({ revalidated: false, results });
  }
  if (failed.length > 0) {
    console.warn("/api/revalidate: some paths failed", failed);
  }

  return res.status(200).json({ revalidated: true, results });
}
