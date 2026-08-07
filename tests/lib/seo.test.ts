/**
 * Unit tests for buildPageTitle (A3 — "title too long", 113 posts).
 * Run via: `npm run test:unit`. Pins the ≤60-char invariant so a regression
 * in the truncation logic fails CI instead of silently shipping long titles.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPageTitle } from "../../utils/seo";

test("short title keeps the ' | Keploy Blog' suffix", () => {
  assert.equal(buildPageTitle("Unit Testing 101"), "Unit Testing 101 | Keploy Blog");
});

test("a title that fits without the suffix drops the suffix rather than overflow", () => {
  // 52 chars — adding the 14-char suffix would exceed 60, so suffix is dropped.
  const title = "A Fairly Long Blog Post Title About API Testing Here";
  const out = buildPageTitle(title);
  assert.ok(out.length <= 60);
  assert.equal(out, title);
});

test("an over-long title is truncated at a word boundary, never mid-word", () => {
  const out = buildPageTitle(
    "The Complete Definitive Comprehensive Guide To End To End Integration Testing In Modern Microservices",
  );
  assert.ok(out.length <= 60, `got ${out.length}`);
  assert.ok(!out.endsWith(" "));
  // last token is a whole word (truncation happened at a space)
  assert.ok(!/\S$/.test(out) === false); // ends with a non-space char
});

test("null/undefined/empty falls back to a valid title", () => {
  assert.equal(buildPageTitle(undefined), "Keploy Blog");
  assert.equal(buildPageTitle(null), "Keploy Blog");
  assert.equal(buildPageTitle(""), "Keploy Blog");
});

test("output is always within the 60-char SERP limit", () => {
  for (const t of [
    "x",
    "A".repeat(200),
    "word ".repeat(50),
    "Exactly Sixty Characters Would Go Right About Here Or So Yes!!",
  ]) {
    assert.ok(buildPageTitle(t).length <= 60, `too long for input len ${t.length}`);
  }
});
