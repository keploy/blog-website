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
    name,
    email,
    company: String(data.companyName ?? "").trim(),
    page: String(data.page ?? ""),
    submittedAt: new Date().toISOString(),
  };

  const webhook = process.env.GOOGLE_CHAT_WEBHOOK_URL;
  if (!webhook) {
    // No PII in logs. Set GOOGLE_CHAT_WEBHOOK_URL to deliver leads to the space.
    console.error(
      "[blog-lead] GOOGLE_CHAT_WEBHOOK_URL is not configured — lead accepted but NOT delivered. Set the env var to enable delivery.",
    );
    return res.status(200).json({ ok: true, delivered: false });
  }

  try {
    // Google Chat renders *bold* / _italic_ and <url|label> in `text` messages.
    const text =
      `*📨 New Keploy blog subscriber*\n` +
      `*Name:* ${lead.name}\n` +
      `*Email:* ${lead.email}\n` +
      `*Company:* ${lead.company || "—"}\n` +
      `*Page:* ${lead.page ? `<${lead.page}|${lead.page}>` : "—"}\n` +
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
