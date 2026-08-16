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
//   • Abuse: a hidden honeypot field + a best-effort per-IP rate limit keep
//     casual flooding out. Stronger gating (reCAPTCHA Enterprise verification,
//     matching the /blog-mql path) is tracked as a follow-up.
// If the env var is unset the submission still succeeds for the user, but the
// lead is NOT delivered.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Best-effort in-memory per-IP rate limit. On serverless this is per-instance,
// not global, so it caps bursts against a hot instance rather than guaranteeing
// a hard ceiling — enough to blunt casual flooding of the chat space without
// pulling in an external store.
const RATE_LIMIT_MAX = 5; // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per minute, per IP
const rateHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const hits = (rateHits.get(ip) || []).filter((t) => t > cutoff);
  hits.push(now);
  rateHits.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

function clientIp(req: NextApiRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return (raw?.split(",")[0].trim() || req.socket.remoteAddress || "unknown");
}

// Strip characters that carry meaning in Google Chat `text` messages so user
// input can't inject formatting (*bold* / _italic_), fake clickable links
// (<url|label>), or break the layout with newlines. Also caps length.
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
    return res.status(200).json({ ok: true, delivered: false });
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

  const lead = {
    name: sanitize(name, 120),
    email: sanitize(email, 254),
    company: sanitize(String(data.companyName ?? ""), 160),
    page: sanitize(String(data.page ?? ""), 500),
    submittedAt: new Date().toISOString(),
  };

  const webhook = process.env.GOOGLE_CHAT_WEBHOOK_URL;
  if (!webhook) {
    // No PII in logs. Set GOOGLE_CHAT_WEBHOOK_URL to deliver leads to the space.
    // Expected steady state until the env is set, so warn once, not every submit.
    if (!warnedMissingWebhook) {
      warnedMissingWebhook = true;
      console.warn(
        "[blog-lead] GOOGLE_CHAT_WEBHOOK_URL is not configured — leads accepted but NOT delivered. Set the env var to enable delivery.",
      );
    }
    return res.status(200).json({ ok: true, delivered: false });
  }

  try {
    // page is rendered as plain (sanitized) text, not a <url|label> link, so a
    // direct POST can't inject a misleading clickable URL.
    const text =
      `*📨 New Keploy blog subscriber*\n` +
      `*Name:* ${lead.name}\n` +
      `*Email:* ${lead.email}\n` +
      `*Company:* ${lead.company || "—"}\n` +
      `*Page:* ${lead.page || "—"}\n` +
      `*Submitted:* ${lead.submittedAt}`;

    const chatRes = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ text }),
    });
    return res.status(200).json({ ok: true, delivered: chatRes.ok });
  } catch (err) {
    console.error(
      "[blog-lead] delivery to Google Chat failed — verify GOOGLE_CHAT_WEBHOOK_URL is a valid incoming-webhook URL. Lead was NOT delivered.",
      err,
    );
    // Never fail the user — the newsletter subscription path is unaffected.
    return res.status(200).json({ ok: true, delivered: false });
  }
}
