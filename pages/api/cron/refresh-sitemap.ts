import type { NextApiRequest, NextApiResponse } from "next";
import {
  isSearchConsoleSubmissionConfigured,
  submitSitemapToSearchConsole,
} from "../../../lib/google-search-console";

// GSC submission is fast — no WordPress crawl happens here anymore.
// Sitemap generation is handled by ISR in app/sitemap.xml/route.ts.
export const config = { maxDuration: 30 };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const expectedSecret = process.env.CRON_SECRET;

  // distinguish a deployment misconfiguration (500) from a wrong token (401).
  if (!expectedSecret) {
    console.error(
      "CRON_SECRET is not configured. Set it in Vercel environment variables and redeploy."
    );
    return res.status(500).json({
      ok: false,
      message: "Server misconfiguration — CRON_SECRET is not configured",
    });
  }

  // auth is checked before method to avoid leaking valid HTTP methods to
  // unauthenticated callers. vercel cron automatically injects this header.
  if (req.headers.authorization !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  // skip silently if google search console env vars are not all configured.
  if (!isSearchConsoleSubmissionConfigured()) {
    return res.status(200).json({
      ok: true,
      message: "Google Search Console submission is not configured — skipped",
    });
  }

  try {
    // notify google that the sitemap has been updated so it re-crawls it.
    // the sitemap itself is generated and cached by ISR — no crawl needed here.
    const result = await submitSitemapToSearchConsole();
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error(
      "Google Search Console sitemap submission failed. " +
        "Verify GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, " +
        "GOOGLE_SEARCH_CONSOLE_SITE_URL, and Search Console property access for the service account.",
      error
    );
    return res.status(500).json({
      ok: false,
      message:
        error instanceof Error ? error.message : "Google Search Console submission failed",
    });
  }
}
