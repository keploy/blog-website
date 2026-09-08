/**
 * Unit tests for the on-demand revalidation endpoint (pages/api/revalidate.ts).
 *
 * Run via: `npm run test:unit`
 *
 * This endpoint is the blog's entire freshness mechanism now that every page
 * sits behind a 24h safety-net TTL, and it is reachable from the public
 * internet. Two classes of regression matter:
 *
 *   1. Auth / input handling. It can force unbounded page regeneration, so a
 *      bypass is both a correctness and a cost problem.
 *   2. Target coverage. If a page type stops being revalidated here, nothing
 *      fails loudly — the page just silently serves stale content for up to a
 *      day. That is precisely the bug this file is meant to catch.
 */

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import handler from "../../pages/api/revalidate";
import { BASE_PATH } from "../../lib/isr";

const SECRET = "unit-test-secret";

function mockRes() {
  const revalidated: string[] = [];
  const failFor = new Set<string>();
  const res: any = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: undefined as any,
    revalidated,
    failFor,
    setHeader(key: string, value: string) {
      res.headers[key.toLowerCase()] = value;
    },
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: any) {
      res.body = payload;
      return res;
    },
    async revalidate(path: string) {
      if (failFor.has(path)) throw new Error(`Failed to revalidate ${path}`);
      revalidated.push(path);
    },
  };
  return res;
}

function mockReq(overrides: any = {}) {
  return {
    method: "POST",
    headers: { "x-revalidate-secret": SECRET },
    body: {},
    ...overrides,
  } as any;
}

let originalSecret: string | undefined;

beforeEach(() => {
  originalSecret = process.env.REVALIDATE_SECRET;
  process.env.REVALIDATE_SECRET = SECRET;
});

afterEach(() => {
  if (originalSecret === undefined) delete process.env.REVALIDATE_SECRET;
  else process.env.REVALIDATE_SECRET = originalSecret;
});

test("rejects non-POST", async () => {
  const res = mockRes();
  await handler(mockReq({ method: "GET" }), res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.revalidated.length, 0);
});

test("fails closed when REVALIDATE_SECRET is unset", async () => {
  delete process.env.REVALIDATE_SECRET;
  const res = mockRes();
  await handler(mockReq({ body: { slug: "a", category: "community" } }), res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.revalidated.length, 0);
});

test("rejects a missing or wrong secret", async () => {
  for (const headers of [{}, { "x-revalidate-secret": "nope" }, { "x-revalidate-secret": "" }]) {
    const res = mockRes();
    await handler(mockReq({ headers, body: { slug: "a", category: "community" } }), res);
    assert.equal(res.statusCode, 401, `expected 401 for ${JSON.stringify(headers)}`);
    assert.equal(res.revalidated.length, 0);
  }
});

test("secret comparison tolerates a length mismatch instead of throwing", async () => {
  // timingSafeEqual throws on unequal buffer lengths; the handler hashes first.
  const res = mockRes();
  await handler(
    mockReq({ headers: { "x-revalidate-secret": "x" }, body: { slug: "a" } }),
    res
  );
  assert.equal(res.statusCode, 401);
});

test("requires slug or paths", async () => {
  const res = mockRes();
  await handler(mockReq({ body: {} }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.revalidated.length, 0);
});

test("revalidates the post plus every surface that lists it", async () => {
  const res = mockRes();
  await handler(
    mockReq({
      body: {
        slug: "my-post",
        category: "community",
        tags: ["API Testing"],
        author: "neha",
      },
    }),
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.revalidated, true);

  // A publish that isn't reflected on these pages is invisible for up to 24h.
  for (const expected of [
    `${BASE_PATH}/community/my-post`,
    BASE_PATH,
    `${BASE_PATH}/community`,
    `${BASE_PATH}/technology`,
    `${BASE_PATH}/search`,
    `${BASE_PATH}/community/search`,
    `${BASE_PATH}/tag`,
    `${BASE_PATH}/authors`,
    `${BASE_PATH}/tag/API%20Testing`,
    `${BASE_PATH}/authors/neha`,
  ]) {
    assert.ok(
      res.revalidated.includes(expected),
      `expected ${expected} to be revalidated, got ${JSON.stringify(res.revalidated)}`
    );
  }
});

test("revalidates both category URLs when the category is unknown", async () => {
  const res = mockRes();
  await handler(mockReq({ body: { slug: "moved-post" } }), res);
  assert.ok(res.revalidated.includes(`${BASE_PATH}/community/moved-post`));
  assert.ok(res.revalidated.includes(`${BASE_PATH}/technology/moved-post`));
});

test("ignores an unrecognised category rather than trusting it", async () => {
  const res = mockRes();
  await handler(mockReq({ body: { slug: "p", category: "../../etc" } }), res);
  assert.ok(!res.revalidated.some((p: string) => p.includes("etc")));
  assert.ok(res.revalidated.includes(`${BASE_PATH}/community/p`));
});

test("rejects slugs and segments that could escape their path segment", async () => {
  for (const slug of ["..", ".", "a/b", "a\\b", "", "   "]) {
    const res = mockRes();
    await handler(mockReq({ body: { slug } }), res);
    assert.equal(res.statusCode, 400, `slug ${JSON.stringify(slug)} should be rejected`);
  }
});

test("explicit paths are confined to the basePath", async () => {
  const res = mockRes();
  await handler(
    mockReq({
      body: {
        paths: [
          `${BASE_PATH}/community/ok`, // allowed
          "/community/no-basepath", // outside basePath
          "https://evil.example.com/x", // absolute URL
          "//evil.example.com/x", // protocol-relative
          `${BASE_PATH}/../../etc/passwd`, // traversal
          `${BASE_PATH}//evil`, // double slash
          "/etc/passwd",
        ],
      },
    }),
    res
  );

  assert.equal(res.statusCode, 200);
  assert.ok(res.revalidated.includes(`${BASE_PATH}/community/ok`));
  for (const bad of ["evil.example.com", "etc/passwd", "no-basepath"]) {
    assert.ok(
      !res.revalidated.some((p: string) => p.includes(bad)),
      `${bad} must never be revalidated`
    );
  }
});

test("caps the fan-out an authenticated caller can request", async () => {
  const res = mockRes();
  const paths = Array.from({ length: 500 }, (_, i) => `${BASE_PATH}/community/post-${i}`);
  await handler(mockReq({ body: { paths } }), res);

  // 50 explicit + the fixed listing/search/index targets — nowhere near 500.
  assert.ok(
    res.revalidated.length < 100,
    `expected the fan-out to be capped, got ${res.revalidated.length}`
  );
});

test("one failing path does not abort the rest", async () => {
  const res = mockRes();
  res.failFor.add(`${BASE_PATH}/technology`);
  await handler(mockReq({ body: { slug: "p", category: "community" } }), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.revalidated, true);
  assert.ok(res.revalidated.includes(`${BASE_PATH}/community/p`));
  assert.ok(
    res.body.results.some((r: any) => r.path === `${BASE_PATH}/technology` && !r.revalidated)
  );
});

test("reports 500 only when every path fails", async () => {
  const res = mockRes();
  const failAll = { ...res, async revalidate(p: string) { throw new Error(`boom ${p}`); } };
  failAll.setHeader = res.setHeader;
  failAll.status = (c: number) => { failAll.statusCode = c; return failAll; };
  failAll.json = (b: any) => { failAll.body = b; return failAll; };

  await handler(mockReq({ body: { slug: "p", category: "community" } }), failAll as any);
  assert.equal(failAll.statusCode, 500);
  assert.equal(failAll.body.revalidated, false);
});

test("never allows its own response to be cached", async () => {
  const res = mockRes();
  await handler(mockReq({ body: { slug: "p", category: "community" } }), res);
  assert.equal(res.headers["cache-control"], "no-store");
});
