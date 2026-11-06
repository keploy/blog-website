/**
 * Unit tests for resolveAuthorAvatar (lib/constants).
 *
 * Run via: `npm run test:unit`
 *
 * Several WordPress authors carry junk in ppmaAuthorImage — the literal strings
 * "imag1" / "image", "n/a", or empty. Passing those to next/image renders
 * /_next/image?url=imag1 → HTTP 400 → a broken byline avatar on every post that
 * author wrote (22 authors were affected). These cases pin that any non-URL value
 * collapses to the placeholder, while a genuine URL passes through untouched.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAuthorAvatar, AUTHOR_AVATAR_PLACEHOLDER } from "../../lib/constants";

test("junk WordPress values fall back to the placeholder (the 22-author bug)", () => {
  for (const junk of ["imag1", "image", "n/a", "", "   ", "img", "author"]) {
    assert.equal(
      resolveAuthorAvatar(junk),
      AUTHOR_AVATAR_PLACEHOLDER,
      `"${junk}" must resolve to the placeholder, not a broken next/image src`,
    );
  }
});

test("null / undefined resolve to the placeholder", () => {
  assert.equal(resolveAuthorAvatar(undefined), AUTHOR_AVATAR_PLACEHOLDER);
  assert.equal(resolveAuthorAvatar(null), AUTHOR_AVATAR_PLACEHOLDER);
});

test("a genuine http(s) avatar URL passes through unchanged", () => {
  const real = "https://wp.keploy.io/wp-content/uploads/2025/08/Sancharini-Panda.webp";
  assert.equal(resolveAuthorAvatar(real), real);
  // trims surrounding whitespace but keeps the URL
  assert.equal(resolveAuthorAvatar(`  ${real}  `), real);
});

test("a root-relative local path (incl. the placeholder itself) passes through", () => {
  assert.equal(resolveAuthorAvatar("/blog/images/author.webp"), "/blog/images/author.webp");
  assert.equal(resolveAuthorAvatar(AUTHOR_AVATAR_PLACEHOLDER), AUTHOR_AVATAR_PLACEHOLDER);
});
