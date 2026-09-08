/**
 * Unit tests for the ISR revalidation policy (lib/isr.ts).
 *
 * Run via: `npm run test:unit`
 *
 * These pin two things that fail *silently* in production if they drift:
 *
 *   1. BASE_PATH vs next.config.js. `res.revalidate(path)` does not look up a
 *      route — on Vercel it performs a real `fetch('https://' + host + path)`.
 *      If BASE_PATH stops matching the app's basePath, every webhook-driven
 *      revalidation 404s, nothing regenerates, and the only symptom is content
 *      going stale up to 24h later. Nothing else in the build catches this.
 *
 *   2. The TTL ordering. The whole point of the on-demand setup is that
 *      content and not-found TTLs stay large; someone "fixing" perceived
 *      staleness by dropping them back to 10/60s would quietly restore the
 *      ~2,224 GB-Hrs/period regeneration bill.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  BASE_PATH,
  postPath,
  REVALIDATE_CONTENT,
  REVALIDATE_ERROR,
  REVALIDATE_NOT_FOUND,
} from "../../lib/isr";

// Read next.config.js as text rather than importing it: the config throws at
// module load unless WORDPRESS_API_URL is set, which we don't want to require
// just to assert a constant.
function basePathFromNextConfig(): string {
  const configPath = path.join(process.cwd(), "next.config.js");
  const source = readFileSync(configPath, "utf8");
  const match = source.match(/^\s*basePath:\s*['"]([^'"]+)['"]/m);
  assert.ok(match, "could not find `basePath` in next.config.js");
  return match![1];
}

test("BASE_PATH matches basePath in next.config.js", () => {
  assert.equal(
    BASE_PATH,
    basePathFromNextConfig(),
    "lib/isr.ts BASE_PATH has drifted from next.config.js — on-demand " +
      "revalidation would silently 404 on every path"
  );
});

test("postPath builds a public URL path including the basePath", () => {
  assert.equal(postPath("community", "my-post"), `${BASE_PATH}/community/my-post`);
  assert.equal(postPath("technology", "my-post"), `${BASE_PATH}/technology/my-post`);
});

test("postPath output is absolute — res.revalidate rejects relative paths", () => {
  // Next throws "Invalid urlPath provided to revalidate()" for anything not
  // starting with "/".
  assert.ok(postPath("community", "x").startsWith("/"));
});

test("content and not-found TTLs stay long enough to keep regeneration off the hot path", () => {
  const ONE_HOUR = 3600;

  assert.ok(
    REVALIDATE_CONTENT >= ONE_HOUR,
    `REVALIDATE_CONTENT is ${REVALIDATE_CONTENT}s. Freshness comes from the ` +
      `WordPress webhook, not from polling — see docs/on-demand-revalidation.md`
  );

  assert.ok(
    REVALIDATE_NOT_FOUND >= ONE_HOUR,
    `REVALIDATE_NOT_FOUND is ${REVALIDATE_NOT_FOUND}s. A short TTL lets ` +
      `bot-sprayed URLs re-render on every expiry — unbounded function duration`
  );
});

test("error TTL stays short so a WordPress blip self-heals", () => {
  assert.ok(
    REVALIDATE_ERROR <= 300,
    `REVALIDATE_ERROR is ${REVALIDATE_ERROR}s — too long. A transient WP ` +
      `failure would pin a real post as a 404 for that whole window.`
  );
  assert.ok(
    REVALIDATE_ERROR < REVALIDATE_NOT_FOUND,
    "degraded responses must retry sooner than genuine 404s"
  );
});
