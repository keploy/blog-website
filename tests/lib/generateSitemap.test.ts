/**
 * Unit tests for the sitemap redirect resolver (scripts/generate-sitemap.mjs).
 *
 * Run via: `npm run test:unit`
 *
 * The resolver parses 37+ redirects from vercel.json + next.config.js and
 * applies them to every production <loc>. A regression here silently ships a
 * redirecting URL (SEMrush "incorrect pages in sitemap") or files a post's
 * lastmod under the wrong category — neither fails loudly. These tests pin the
 * pure logic (network + file IO stay in main(), which only runs when invoked
 * directly).
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizePath,
  resolveLoc,
  categoryFromLoc,
  buildEntries,
} from "../../scripts/generate-sitemap.mjs";

const SITE = "https://keploy.io";

test("normalizePath strips hash/query, adds leading slash, drops trailing slash", () => {
  assert.equal(normalizePath("/blog/technology/x/"), "/blog/technology/x");
  assert.equal(normalizePath("/blog/x?utm=1#top"), "/blog/x");
  assert.equal(normalizePath("blog/x"), "/blog/x");
  assert.equal(normalizePath("/"), "/");
  assert.equal(normalizePath(""), "");
});

test("resolveLoc follows a redirect chain to its final path", () => {
  const map = new Map([
    ["/blog/community/a", "/blog/technology/a"],
    ["/blog/technology/a", "/blog/technology/a-final"],
  ]);
  assert.equal(
    resolveLoc(`${SITE}/blog/community/a`, map, SITE),
    `${SITE}/blog/technology/a-final`,
  );
});

test("resolveLoc leaves non-site URLs and unmapped paths untouched", () => {
  const map = new Map([["/blog/x", "/blog/y"]]);
  assert.equal(resolveLoc("https://elsewhere.com/x", map, SITE), "https://elsewhere.com/x");
  assert.equal(resolveLoc(`${SITE}/blog/keep`, map, SITE), `${SITE}/blog/keep`);
});

test("resolveLoc terminates on a redirect cycle instead of looping forever", () => {
  const map = new Map([
    ["/blog/a", "/blog/b"],
    ["/blog/b", "/blog/a"],
  ]);
  // must return (not hang); the emitted path is still one of the cycle nodes
  const out = resolveLoc(`${SITE}/blog/a`, map, SITE);
  assert.ok(out.startsWith(`${SITE}/blog/`));
});

test("categoryFromLoc reads the category from a resolved loc", () => {
  assert.equal(categoryFromLoc(`${SITE}/blog/technology/x`, SITE), "technology");
  assert.equal(categoryFromLoc(`${SITE}/blog/community/x`, SITE), "community");
  assert.equal(categoryFromLoc(`${SITE}/blog/unknown/x`, SITE), null);
  assert.equal(categoryFromLoc(`${SITE}/blog/technology`, SITE), null); // no slug segment
});

test("buildEntries buckets lastmod by the RESOLVED category (N3 regression)", () => {
  // Two community posts: one stays, one 301s to /technology with a newer date.
  // The newer date must lift TECHNOLOGY's lastmod (its resolved home); community
  // must keep its own genuine date. The old bug filed the newer date under
  // community, which this pins against.
  const posts = [
    {
      slug: "stays",
      modified: "2021-01-01T00:00:00",
      date: "2021-01-01T00:00:00",
      categories: { edges: [{ node: { slug: "community" } }] },
    },
    {
      slug: "moved",
      modified: "2026-08-01T00:00:00",
      date: "2020-01-01T00:00:00",
      categories: { edges: [{ node: { slug: "community" } }] },
    },
  ];
  const redirectMap = new Map([
    ["/blog/community/moved", "/blog/technology/moved"],
  ]);
  const entries = buildEntries(posts, SITE, redirectMap);

  const tech = entries.find((e) => e.loc === `${SITE}/blog/technology`);
  const community = entries.find((e) => e.loc === `${SITE}/blog/community`);
  assert.equal(tech.lastmod, "2026-08-01", "resolved category gets the moved post's lastmod");
  assert.equal(community.lastmod, "2021-01-01", "origin category keeps its own date, not the moved post's");

  // and the moved post is emitted at its resolved (non-redirecting) URL
  assert.ok(entries.some((e) => e.loc === `${SITE}/blog/technology/moved`));
  assert.ok(!entries.some((e) => e.loc === `${SITE}/blog/community/moved`));
});

test("buildEntries resolves + dedups a redirected archive root, bucketing by resolved category (R3)", () => {
  // /blog/community 301s to /blog/technology. The static root entry must be
  // emitted at the resolved URL, carry TECHNOLOGY's lastmod (not community's),
  // and NOT duplicate the existing /blog/technology root — the same bug shape
  // N3 fixed, one layer up (static entries instead of posts).
  const posts = [
    {
      slug: "tpost",
      modified: "2026-08-01T00:00:00",
      date: "2026-08-01T00:00:00",
      categories: { edges: [{ node: { slug: "technology" } }] },
    },
  ];
  const redirectMap = new Map([["/blog/community", "/blog/technology"]]);
  const entries = buildEntries(posts, SITE, redirectMap);

  const techRoots = entries.filter((e) => e.loc === `${SITE}/blog/technology`);
  assert.equal(techRoots.length, 1, "the redirected root must not duplicate /blog/technology");
  assert.equal(techRoots[0].lastmod, "2026-08-01", "resolved root carries technology's lastmod");
  assert.ok(
    !entries.some((e) => e.loc === `${SITE}/blog/community`),
    "the pre-redirect community root must not be emitted",
  );
});
