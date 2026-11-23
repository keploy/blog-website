/**
 * Unit tests for the 404 page's redirect destination
 * (lib/not-found-redirect.ts).
 *
 * Run via: `npm run test:unit`
 *
 * The 404 page used to decide its destination in two places that disagreed
 * (a path-aware router timer and a countdown that always went to `/blog`).
 * This pins the single rule that replaced them.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { getNotFoundRedirectTarget } from "../../lib/not-found-redirect";

test("a missing community post redirects to the community index", () => {
  assert.equal(getNotFoundRedirectTarget("/community/does-not-exist"), "/community");
});

test("a missing technology post redirects to the technology index", () => {
  assert.equal(getNotFoundRedirectTarget("/technology/does-not-exist"), "/technology");
});

test("any other missing path redirects to the blog home", () => {
  assert.equal(getNotFoundRedirectTarget("/this-page-does-not-exist"), "/");
  assert.equal(getNotFoundRedirectTarget("/tag/nope/deeper"), "/");
});

test("query string and hash do not change the destination", () => {
  assert.equal(getNotFoundRedirectTarget("/community/x?utm_source=a#top"), "/community");
  assert.equal(getNotFoundRedirectTarget("/nope?ref=/community/"), "/");
});

test("a lookalike prefix is not treated as a section", () => {
  assert.equal(getNotFoundRedirectTarget("/communityfoo/bar"), "/");
  assert.equal(getNotFoundRedirectTarget("/technologies/bar"), "/");
});

test("the bare section path and empty input are handled", () => {
  assert.equal(getNotFoundRedirectTarget("/community"), "/community");
  assert.equal(getNotFoundRedirectTarget(""), "/");
});
