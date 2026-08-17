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
const RATE_MAP_MAX_KEYS = 10_000; // evict stale IPs past this so the map can't grow unbounded
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
// input can't inject formatting (*bold* / _italic_), fake clickable links
// (<url|label>), or forge whole labelled fields with newlines. Also caps length.
// Every user-supplied field passes through this before it reaches the message.
function sanitize(value: string, max = 200): string {
  return value
    .replace(/[<>|*_`\r\n]/g, " ")
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

  const name = String(data.fullName ?? "").trim();
  const email = String(data.email ?? "").trim();
  // Re-validate server-side: a request could hit this endpoint directly and
  // bypass the client-side checks.
  if (!name || !EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: "validation" });
  }

  const rawSource = String(data.source ?? "").trim();
  const lead = {
    name: sanitize(name, 120),
    // Lowercase server-side too (the client already does), so a direct hit
    // can't create case-variant leads — same normalization the blog-mql path uses.
    email: sanitize(email.toLowerCase(), 254),
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
  const timer = setTimeout(() => controller.abort(), 15000);
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

    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[blog-lead] delivery to Google Chat failed — verify GOOGLE_CHAT_WEBHOOK_URL is a valid incoming-webhook URL. Lead was NOT delivered.",
        err,
      );
    }
    // Never fail the user — the newsletter subscription path is unaffected.
    return res.status(200).json({ ok: true });
  } finally {
    clearTimeout(timer);
  }
}
