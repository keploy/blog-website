/**
 * Unit tests for the blog lead -> Google Chat notify endpoint
 * (pages/api/blog-lead-notify.ts).
 *
 * Run via: `npm run test:unit`
 *
 * This is a public, unauthenticated POST whose side effect is a message in the
 * team's Chat space, so the regressions that matter are security-shaped and
 * easy to reintroduce in a refactor:
 *
 *   1. Chat-markup injection — user fields must be sanitized so a direct POST
 *      can't forge labelled fields, clickable links, or bold/italic.
 *   2. Abuse controls — honeypot + per-IP rate limit must actually gate.
 *   3. No oracle / no PII leak, and fail-open so a Chat hiccup never 500s.
 */

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import handler from "../../pages/api/blog-lead-notify";

const WEBHOOK = "https://chat.googleapis.com/v1/spaces/AAA/messages?key=k&token=t";

let fetchCalls: Array<{ url: any; body: any }> = [];
const realFetch = global.fetch;

beforeEach(() => {
  fetchCalls = [];
  // Capture the outbound Chat webhook call; pretend Chat accepted it.
  global.fetch = (async (url: any, opts: any) => {
    fetchCalls.push({ url, body: opts?.body ? JSON.parse(opts.body) : undefined });
    return { ok: true } as any;
  }) as any;
});

afterEach(() => {
  global.fetch = realFetch;
  delete process.env.GOOGLE_CHAT_WEBHOOK_URL;
});

function mockRes() {
  const res: any = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: undefined as any,
    setHeader(k: string, v: string) { res.headers[k.toLowerCase()] = v; },
    status(code: number) { res.statusCode = code; return res; },
    json(payload: any) { res.body = payload; return res; },
  };
  return res;
}

// Distinct IP per call by default so the module-level rate-limit map doesn't
// bleed between tests. Pass a fixed ip to exercise the limit itself.
let ipSeq = 0;
function mockReq(overrides: any = {}) {
  const ip = overrides.ip || `10.0.0.${(ipSeq++ % 250) + 1}`;
  return {
    method: "POST",
    headers: { "x-real-ip": ip },
    socket: { remoteAddress: ip },
    body: { fullName: "Jane", email: "jane@keploy.io", companyName: "Acme", page: "https://keploy.io/blog/x" },
    ...overrides,
  } as any;
}

test("rejects non-POST with 405", async () => {
  const res = mockRes();
  await handler(mockReq({ method: "GET" }), res);
  assert.equal(res.statusCode, 405);
  assert.equal(fetchCalls.length, 0);
});

test("honeypot: filled company_website is silently dropped, no webhook call, no leak", async () => {
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  const res = mockRes();
  await handler(mockReq({ body: { fullName: "Bot", email: "b@b.com", company_website: "http://evil" } }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true }); // no `delivered` oracle
  assert.equal(fetchCalls.length, 0);
});

test("rejects invalid email and missing name with 400", async () => {
  const r1 = mockRes();
  await handler(mockReq({ body: { fullName: "Jane", email: "not-an-email" } }), r1);
  assert.equal(r1.statusCode, 400);

  const r2 = mockRes();
  await handler(mockReq({ body: { fullName: "", email: "jane@keploy.io" } }), r2);
  assert.equal(r2.statusCode, 400);
  assert.equal(fetchCalls.length, 0);
});

test("no webhook configured: accepts but does not deliver, and does not leak that", async () => {
  const res = mockRes();
  await handler(mockReq(), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(fetchCalls.length, 0);
});

test("valid lead with webhook: posts a sanitized message to Chat", async () => {
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  const res = mockRes();
  await handler(mockReq(), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url, WEBHOOK);
  assert.match(fetchCalls[0].body.text, /New Keploy blog subscriber/);
  assert.match(fetchCalls[0].body.text, /jane@keploy\.io/);
});

test("sanitizes Chat markup: no injected newlines, links, or bold/italic reach the message", async () => {
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  const res = mockRes();
  await handler(mockReq({
    body: {
      fullName: "Legit\n*Email:* ceo@keploy.io",
      email: "attacker@mail.com",
      companyName: "<https://evil.example/verify|Approve>",
      page: "https://keploy.io/blog/x`_*",
    },
  }), res);
  const text: string = fetchCalls[0].body.text;
  // exactly the 7 template lines — attacker newlines can't forge extra lines
  assert.equal(text.split("\n").length, 7);
  // forged clickable link + labelled-field injection are stripped
  assert.ok(!text.includes("<https://evil.example/verify|Approve>"));
  assert.ok(!text.includes("|Approve"));
  assert.ok(!text.includes("Legit\n*Email:* ceo"));
  // the sanitized Name line carries no markup metacharacters
  const nameLine = text.split("\n").find((l) => l.startsWith("*Name:*")) || "";
  assert.ok(!/[<>|`_*]/.test(nameLine.replace(/^\*Name:\*/, "")));
});

test("keeps underscores: email local part and UTM-tagged page survive intact", async () => {
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  const res = mockRes();
  await handler(mockReq({
    body: {
      fullName: "John Doe",
      email: "john_doe@keploy.io",
      companyName: "Acme",
      page: "https://keploy.io/blog/technology/x?utm_source=twitter&utm_campaign=q3_launch",
    },
  }), res);
  const text: string = fetchCalls[0].body.text;
  // `_` is legal in emails and common in UTM params — stripping it corrupts the
  // lead the team needs to reply to and the campaign attribution URL.
  assert.match(text, /\*Email:\* john_doe@keploy\.io/);
  assert.match(text, /utm_source=twitter&utm_campaign=q3_launch/);
});

test("surfaces a non-OK Chat status without failing the user", async () => {
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  const warnings: string[] = [];
  const realWarn = console.warn;
  console.warn = ((...args: any[]) => { warnings.push(args.join(" ")); }) as any;
  // Chat rejects the message (e.g. revoked webhook) — fetch resolves, not rejects.
  global.fetch = (async (url: any, opts: any) => {
    fetchCalls.push({ url, body: opts?.body ? JSON.parse(opts.body) : undefined });
    return { ok: false, status: 404 } as any;
  }) as any;
  try {
    const res = mockRes();
    await handler(mockReq(), res);
    // User is never blocked, and the constant response gives no delivery oracle.
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { ok: true });
    // ...but the broken delivery is logged so it doesn't fail silently.
    assert.ok(warnings.some((w) => w.includes("404") && /rejected the message/i.test(w)));
  } finally {
    console.warn = realWarn;
  }
});

test("rejects an email that only validates before sanitizing (a*b@x.com -> 400)", async () => {
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  const res = mockRes();
  // `a*b@x.com` passes EMAIL_RE raw, but sanitize turns the `*` into a space, so
  // validating the sanitized value must 400 rather than deliver "a b@x.com".
  await handler(mockReq({ body: { fullName: "Jane", email: "a*b@x.com" } }), res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { ok: false, error: "validation" });
  assert.equal(fetchCalls.length, 0);
});

test("pins source server-side: a forged source falls back to the default", async () => {
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  const res = mockRes();
  await handler(mockReq({ body: { fullName: "Jane", email: "jane@keploy.io", source: "trusted-partner" } }), res);
  assert.match(fetchCalls[0].body.text, /\*Source:\* blog-newsletter/);
  assert.ok(!fetchCalls[0].body.text.includes("trusted-partner"));
});

test("caps oversized fields so delivery stays under Chat's limit", async () => {
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  const res = mockRes();
  await handler(mockReq({ body: { fullName: "n".repeat(500), email: "jane@keploy.io", companyName: "c".repeat(500), page: "p".repeat(2000) } }), res);
  const text: string = fetchCalls[0].body.text;
  assert.ok(text.length < 4096);
});

test("per-IP rate limit: 6th request in the window is 429", async () => {
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  const ip = "203.0.113.9";
  const codes: number[] = [];
  for (let i = 0; i < 6; i++) {
    const res = mockRes();
    await handler(mockReq({ ip, headers: { "x-real-ip": ip } }), res);
    codes.push(res.statusCode);
  }
  assert.deepEqual(codes.slice(0, 5), [200, 200, 200, 200, 200]);
  assert.equal(codes[5], 429);
});

test("fail-open: a Chat webhook error still returns 200 (never blocks the user)", async () => {
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  global.fetch = (async () => { throw new Error("network down"); }) as any;
  const res = mockRes();
  await handler(mockReq(), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
});

test("surfaces a network failure in production without leaking the webhook URL", async () => {
  // The !chatRes.ok branch already logs in production; a network-level failure
  // (DNS / refused connection / TLS / abort) is just as silent and permanent,
  // so it must be visible too — otherwise leads quietly stop arriving.
  process.env.GOOGLE_CHAT_WEBHOOK_URL = WEBHOOK;
  const realEnv = process.env.NODE_ENV;
  const warnings: string[] = [];
  const realWarn = console.warn;
  console.warn = ((...args: any[]) => { warnings.push(args.join(" ")); }) as any;
  // undici surfaces network failures as a `fetch failed` TypeError whose detail
  // lives in `cause` (host only, never the query string that holds the secret).
  global.fetch = (async () => { throw new Error("fetch failed"); }) as any;
  try {
    (process.env as any).NODE_ENV = "production";
    const res = mockRes();
    await handler(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { ok: true });
    // Logged even in production...
    assert.ok(warnings.some((w) => /delivery to Google Chat failed/i.test(w)));
    // ...but the secret webhook URL (key/token) never lands in the log.
    assert.ok(!warnings.some((w) => w.includes("key=k") || w.includes("token=t") || w.includes(WEBHOOK)));
  } finally {
    console.warn = realWarn;
    (process.env as any).NODE_ENV = realEnv;
  }
});
