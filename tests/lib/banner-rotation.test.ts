/**
 * Unit tests for the sidebar ad banner's shared rotation + impression state
 * (lib/banner-rotation.ts).
 *
 * Run via: `npm run test:unit`
 *
 * The sidebar renders twice per page (a wide-desktop ≥1440px copy and a
 * sub-1440px copy), so two SidebarAdBanner instances mount for one page view.
 * The metric this whole feature produces — per-banner CTR = clicks / impressions
 * — is only trustworthy if those two instances agree on ONE banner and fire
 * exactly ONE impression per page view. That invariant is easy to reintroduce a
 * bug into (per-instance state double-counts on a resize across 1440px), so it
 * is pinned here.
 */

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  AD_BANNERS,
  pickBannerForPage,
  hasFiredImpression,
  claimImpression,
  __resetBannerRotation,
} from "../../lib/banner-rotation";

beforeEach(() => {
  __resetBannerRotation();
});

test("both instances on the same page get the identical banner", () => {
  // Force a deterministic, non-first pick so "same banner" isn't trivially true.
  const first = pickBannerForPage("/blog/post-a", () => 0.5);
  const second = pickBannerForPage("/blog/post-a", () => 0.99); // rand ignored: key unchanged
  assert.equal(second, first);
  assert.equal(second.id, first.id);
});

test("a new page (SPA nav) re-picks and re-arms the impression latch", () => {
  const a = pickBannerForPage("/blog/post-a", () => 0);
  assert.equal(a.id, AD_BANNERS[0].id);
  // Fire the impression on page A.
  assert.equal(claimImpression(), true);
  assert.equal(hasFiredImpression(), true);

  // Navigate to page B: new key re-picks and clears the latch.
  const b = pickBannerForPage("/blog/post-b", () => 0.99);
  assert.equal(b.id, AD_BANNERS[AD_BANNERS.length - 1].id);
  assert.equal(hasFiredImpression(), false);
});

test("claimImpression fires exactly once per page view, shared across instances", () => {
  pickBannerForPage("/blog/post-a");
  // First caller (whichever instance is seen first) wins.
  assert.equal(claimImpression(), true);
  // The other instance, and any re-intersection, must NOT re-count.
  assert.equal(claimImpression(), false);
  assert.equal(claimImpression(), false);
  assert.equal(hasFiredImpression(), true);
});

test("re-picking the same key does not reset an already-fired impression", () => {
  pickBannerForPage("/blog/post-a");
  assert.equal(claimImpression(), true);
  // The second instance mounts later (e.g. resize past 1440px) and re-picks the
  // same page — it must see the latch still set so it can't fire a second time.
  pickBannerForPage("/blog/post-a");
  assert.equal(hasFiredImpression(), true);
  assert.equal(claimImpression(), false);
});
