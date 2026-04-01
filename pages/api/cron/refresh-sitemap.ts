import type { NextApiRequest, NextApiResponse } from "next";
import {
  isSearchConsoleSubmissionConfigured,
  submitSitemapToSearchConsole,
} from "../../../lib/google-search-console";
import { refreshSitemapSnapshot } from "../../../lib/sitemap";

export default async function refreshSitemap(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const result = await refreshSitemapSnapshot();
    let searchConsole:
      | {
          submitted: boolean;
          submittedAt?: string;
          sitemapUrl?: string;
          siteUrl?: string;
          skipped?: boolean;
          message?: string;
        }
      | undefined;

    if (isSearchConsoleSubmissionConfigured()) {
      try {
        const submission = await submitSitemapToSearchConsole();
        searchConsole = {
          submitted: true,
          submittedAt: submission.submittedAt,
          sitemapUrl: submission.sitemapUrl,
          siteUrl: submission.siteUrl,
        };
      } catch (error) {
        console.error("Google Search Console sitemap submission failed:", error);
        searchConsole = {
          submitted: false,
          message:
            error instanceof Error
              ? error.message
              : "Google Search Console sitemap submission failed",
        };
      }
    } else {
      searchConsole = {
        submitted: false,
        skipped: true,
        message: "Google Search Console submission is not configured",
      };
    }

    return res.status(200).json({
      ok: true,
      entryCount: result.entryCount,
      generatedAt: result.generatedAt,
      searchConsole,
    });
  } catch (error) {
    console.error("Scheduled sitemap refresh failed:", error);

    return res.status(500).json({
      ok: false,
      message: "Sitemap refresh failed",
    });
  }
}
