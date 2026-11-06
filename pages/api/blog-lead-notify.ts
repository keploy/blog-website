import type { NextApiRequest, NextApiResponse } from "next";

// Server-side handler for blog newsletter / lead submissions. It forwards each
// lead to a Google Chat space via an incoming webhook (GOOGLE_CHAT_WEBHOOK_URL).
// Nothing is persisted here — the newsletter subscription (api-server) and the
// MQL lead (telemetry /blog-mql) are still handled by their own paths. This is
// a notification-only side channel, mirroring the landing repo's trial form.
//
// Security model:
//   • GOOGLE_CHAT_WEBHOOK_URL is a server-only secret (NOT NEXT_PUBLIC_*), so it
//     never reaches the browser bundle. This handler runs server-side only, so
//     the webhook URL is never exposed to the client, git, or logs.
//   • Create it in Google Chat: open the space → Apps & integrations → Webhooks
//     → add one → copy the URL into the env var. Rotate by deleting/recreating.
//   • This is a public, unauthenticated POST whose side effect is a message in
//     the team space, so every user-supplied field MUST be sanitized (see
//     sanitize()) and abuse is blunted with a honeypot + per-IP rate limit.
//     Stronger gating (reCAPTCHA Enterprise verification, matching /blog-mql) is
//     tracked as a follow-up.
// If the env var is unset the submission still succeeds for the user, but the
// lead is NOT delivered.
//
// Data / PII & retention:
//   • The Chat message carries the lead's name, email and company. That makes
//     the Chat space a THIRD place this PII lives, alongside the api-server
//     subscription and telemetry /blog-mql — deleting a lead from those two
//     does NOT remove it from Chat.
//   • Retention is therefore governed by the Google Chat space's own message
//     retention policy (Workspace Admin → Apps → Google Chat → retention). The
//     space MUST be configured with a bounded retention (e.g. auto-delete), and
//     a GDPR/erasure request for a lead has to also purge the relevant Chat
//     messages. Owner: the DevRel team that owns the space + webhook.
//   • If that retention story ever becomes a burden, switch this to a PII-free
//     ping ("new blog lead — see dashboard") and keep identity only in the two
//     stores above.

// Cap how long this function may run. The delivery fetch is aborted at 5s
// (see the AbortController below); this ceiling has to sit ABOVE that abort, or
// the platform kills the invocation before the abort can fire and the catch —
// the branch that logs a stuck webhook — never runs. 10s leaves headroom for
// the abort to trip, log, and respond, and is within every Vercel plan's limit.
// NOTE: this MUST be `export const config = { maxDuration }`, not a bare
// `export const maxDuration`. This is a Pages Router route; Next 14's static-info
// extractor only reads the bare export for the app router (pageType === "app")
// and reads maxDuration from `config` for pages routes — a bare export here is
// silently ignored, leaving the ceiling at the platform default.
export const config = { maxDuration: 10 };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// `source` is pinned to a known set server-side — never echoed from the request
// body — so a direct POST can't forge a trustworthy-looking `*Source:*` line.
const ALLOWED_SOURCES = new Set(["blog-newsletter"]);
const DEFAULT_SOURCE = "blog-newsletter";

// Best-effort in-memory per-IP rate limit. On serverless this is per-instance,
// not global, so it caps bursts against a hot instance rather than guaranteeing
// a hard ceiling — enough to blunt casual flooding of the chat space without
// pulling in an external store.
const RATE_LIMIT_MAX = 5; // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per minute, per IP
// Soft cap on tracked IPs. Only IPs idle past the window are evictable, so a
// flood rotating more than this many IPs *within* a single window can still push
// the map past it — acceptable for an in-memory best-effort limiter (the real
// ceiling against distributed abuse is the reCAPTCHA-verification follow-up).
const RATE_MAP_MAX_KEYS = 10_000;
const rateHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  // Opportunistically drop IPs whose most recent hit is outside the window, so
  // the map doesn't accumulate an entry per distinct IP for the instance's life.
  if (rateHits.size > RATE_MAP_MAX_KEYS) {
    rateHits.forEach((times, key) => {
      if (times.length === 0 || times[times.length - 1] <= cutoff) rateHits.delete(key);
    });
  }

  const hits = (rateHits.get(ip) || []).filter((t) => t > cutoff);
  // Record this hit even when it's the one that trips the limit. Deliberate: a
  // sustained flooder keeps their own window sliding forward and stays limited,
  // rather than earning a fresh allowance the instant they pause for a beat.
  hits.push(now);
  rateHits.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

// Identify the client for rate limiting. On Vercel the trustworthy client IP is
// `x-real-ip` (set by the platform). Do NOT use the leftmost x-forwarded-for
// token — that end is client-supplied and lets an attacker rotate it to dodge
// the limit; the real IP is the LAST hop the trusted proxy appends.
function clientIp(req: NextApiRequest): string {
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();

  const fwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  if (raw) {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return req.socket.remoteAddress || "unknown";
}

// Strip characters that carry meaning in Google Chat `text` messages so user
// input can't inject formatting (*bold*), fake clickable links (<url|label>),
// or forge whole labelled fields with newlines. Also caps length. Every
// user-supplied field passes through this before it reaches the message.
//
// We strip `< > | * ` \r \n` but deliberately KEEP `_` and `~`. The test is NOT
// "is it atext" — `|`, `*` and `` ` `` are atext too, yet we strip them, because
// each injects something concrete: `|` completes a clickable <url|label>, `*`
// bolds, and `` ` `` opens a code span. The distinction that actually earns `_`
// and `~` a pass is two-sided:
//   • Risk: with `< > |` and newlines already gone, all `_`/`~` can still do is
//     cosmetic matched-pair styling (_italic_, ~strike~; a lone one can't format)
//     — never a forged field or a forged link.
//   • Cost: `_`/`~` are legal in email local parts (RFC atext, which EMAIL_RE
//     accepts) and `_` is common in UTM page URLs (utm_source, q3_launch), so
//     unlike `* | ` ` ``, they appear in real lead data and stripping them would
//     corrupt real leads.
function sanitize(value: string, max = 200): string {
  return value
    .replace(/[<>|*`\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// Track the "webhook not configured" warning so it's logged once per instance
// instead of on every submit — the off state is expected until the env is set.
let warnedMissingWebhook = false;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const data = (req.body && typeof req.body === "object" ? req.body : {}) as Record<
    string,
    unknown
  >;

  // Honeypot — the form renders a hidden `company_website` input that humans
  // never see; a filled value means a bot. Silently accept and drop.
  if (data.company_website) {
    return res.status(200).json({ ok: true });
  }

  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({ ok: false, error: "rate_limited" });
  }

  // Sanitize BEFORE validating, same reason as the email below: sanitize() maps
  // < > | * ` and newlines to spaces, so a raw-passing value like "***" would
  // pass the non-empty check and then collapse to "", shipping a blank *Name:*
  // line. Validating the sanitized form 400s those instead ('_'/'~' and real
  // names survive sanitize, see its note).
  const name = sanitize(String(data.fullName ?? ""), 120);
  // Sanitize the email BEFORE validating, so the value we check is the value we
  // deliver. EMAIL_RE accepts `*`, `|` and `` ` `` in a local part, but
  // sanitize() turns each into a space — so validating the raw value could pass
  // an address that sanitize then mangles (a*b@x.com -> "a b@x.com"), delivering
  // a broken *Email:* line. Validating the sanitized form 400s those instead,
  // and never harms real leads (`_`/`~` survive sanitize, see its note).
  const email = sanitize(String(data.email ?? "").toLowerCase(), 254);
  // Re-validate server-side: a request could hit this endpoint directly and
  // bypass the client-side checks.
  if (!name || !EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: "validation" });
  }

  const rawSource = String(data.source ?? "").trim();
  const lead = {
    name,
    // Already sanitized + lowercased above (before validation), so a direct hit
    // can't create case-variant leads — same normalization the blog-mql path uses.
    email,
    company: sanitize(String(data.companyName ?? ""), 160),
    page: sanitize(String(data.page ?? ""), 500),
    source: ALLOWED_SOURCES.has(rawSource) ? rawSource : DEFAULT_SOURCE,
    submittedAt: new Date().toISOString(),
  };

  const webhook = process.env.GOOGLE_CHAT_WEBHOOK_URL;
  if (!webhook) {
    // No PII in logs. Set GOOGLE_CHAT_WEBHOOK_URL to deliver leads to the space.
    // Expected steady state until the env is set, so warn once (and only off
    // production, matching blog-mql.ts) rather than on every submit.
    if (!warnedMissingWebhook && process.env.NODE_ENV !== "production") {
      warnedMissingWebhook = true;
      console.warn(
        "[blog-lead] GOOGLE_CHAT_WEBHOOK_URL is not configured — leads accepted but NOT delivered. Set the env var to enable delivery.",
      );
    }
    // Constant response — don't reveal to an unauthenticated caller whether the
    // webhook is configured or whether their message landed.
    return res.status(200).json({ ok: true });
  }

  const controller = new AbortController();
  // Abort a stuck webhook well under maxDuration (10s) so the catch runs and
  // logs while the function is still alive; a Chat webhook answers in <1s, so
  // 5s is generous headroom, not a tight bound.
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    // page is rendered as plain (sanitized) text, not a <url|label> link, and
    // every field is sanitized, so a direct POST can't inject markup.
    const text =
      `*📨 New Keploy blog subscriber*\n` +
      `*Name:* ${lead.name}\n` +
      `*Email:* ${lead.email}\n` +
      `*Company:* ${lead.company || "—"}\n` +
      `*Source:* ${lead.source}\n` +
      `*Page:* ${lead.page || "—"}\n` +
      `*Submitted:* ${lead.submittedAt}`;

    const chatRes = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    // fetch only rejects on network-level failure, not on an HTTP error status,
    // so a revoked webhook / deleted space / bad URL / quota rejection returns
    // 4xx-5xx and would otherwise look like success — "leads quietly stop
    // arriving and nobody notices". Surface the status so delivery breakage is
    // visible. Logged in production too (unlike the missing-webhook warning):
    // it's the only signal that a *configured* webhook has broken, and the line
    // carries no PII — just the HTTP status code.
    if (!chatRes.ok) {
      console.warn(
        `[blog-lead] Google Chat rejected the message (HTTP ${chatRes.status}) — verify GOOGLE_CHAT_WEBHOOK_URL is a valid, active incoming-webhook URL. Lead was NOT delivered.`,
      );
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    // A network-level failure (DNS / refused connection / TLS / the 5s abort)
    // is just as silent and permanent as a 4xx — leads quietly stop arriving —
    // so surface it in production too, matching the !chatRes.ok branch above.
    // The message is a fixed, PII-free string that never carries the webhook
    // URL; the raw error (PII-free itself for undici, but belt-and-suspenders)
    // is only attached off production.
    const aborted = err instanceof Error && err.name === "AbortError";
    const msg =
      `[blog-lead] delivery to Google Chat failed (${aborted ? "timed out" : "network error"}) — ` +
      "verify GOOGLE_CHAT_WEBHOOK_URL is a valid incoming-webhook URL. Lead was NOT delivered.";
    if (process.env.NODE_ENV !== "production") {
      console.warn(msg, err);
    } else {
      console.warn(msg);
    }
    // Never fail the user — the newsletter subscription path is unaffected.
    return res.status(200).json({ ok: true });
  } finally {
    clearTimeout(timer);
  }
}
