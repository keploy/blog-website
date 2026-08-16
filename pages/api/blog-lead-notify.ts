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
// If the env var is unset the submission still succeeds for the user, but the
// lead is NOT delivered.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Field caps mirror blog-mql.ts. Google Chat rejects `text` over ~4096 chars, so
// an oversized page URL or a long paste would silently fail delivery (chatRes.ok
// false) even for a legit user. Truncate client-visible fields to stay safe.
const CAPS = { name: 120, email: 254, company: 160, page: 500 };
const cap = (value: string, max: number) => value.slice(0, max);

// Abort a hung Google Chat request so a slow webhook can't hold a serverless
// slot open until the platform hard-timeout. Mirrors blog-mql.ts (15s).
const CHAT_TIMEOUT_MS = 15000;

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

  // Honeypot — silently accept (and drop) bot submissions.
  if (data.company_website) {
    return res.status(200).json({ ok: true, delivered: false });
  }

  const name = String(data.fullName ?? "").trim();
  const email = String(data.email ?? "").trim();
  // Re-validate server-side: a request could hit this endpoint directly and
  // bypass the client-side checks.
  if (!name || !EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: "validation" });
  }

  const lead = {
    name: cap(name, CAPS.name),
    // Lowercase server-side too (the client already does), so a direct hit
    // can't create case-variant leads — same normalization the blog-mql path uses.
    email: cap(email.toLowerCase(), CAPS.email),
    company: cap(String(data.companyName ?? "").trim(), CAPS.company),
    page: cap(String(data.page ?? ""), CAPS.page),
    // Where the lead came from, mirroring blog-mql's `source` so both
    // destinations tell the same story. Defaults if a direct hit omits it.
    source: cap(String(data.source ?? "blog-newsletter").trim(), 80),
    submittedAt: new Date().toISOString(),
  };

  const webhook = process.env.GOOGLE_CHAT_WEBHOOK_URL;
  if (!webhook) {
    // No PII in logs. Set GOOGLE_CHAT_WEBHOOK_URL to deliver leads to the space.
    // Gated on non-production (matching blog-mql.ts) so the shipped-off default
    // doesn't spam prod logs / alerting with an expected steady state.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[blog-lead] GOOGLE_CHAT_WEBHOOK_URL is not configured — lead accepted but NOT delivered. Set the env var to enable delivery.",
      );
    }
    return res.status(200).json({ ok: true, delivered: false });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);
  try {
    // Google Chat renders *bold* / _italic_ and <url|label> in `text` messages.
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
    return res.status(200).json({ ok: true, delivered: chatRes.ok });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[blog-lead] delivery to Google Chat failed — verify GOOGLE_CHAT_WEBHOOK_URL is a valid incoming-webhook URL. Lead was NOT delivered.",
        err,
      );
    }
    // Never fail the user — the newsletter subscription path is unaffected.
    return res.status(200).json({ ok: true, delivered: false });
  } finally {
    clearTimeout(timer);
  }
}
