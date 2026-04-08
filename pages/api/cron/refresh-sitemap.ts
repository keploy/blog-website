import type { NextApiRequest, NextApiResponse } from "next";
import {
  isSearchConsoleSubmissionConfigured,
  submitSitemapToSearchConsole,
} from "../../../lib/google-search-console";
import { refreshSitemapSnapshot } from "../../../lib/sitemap";

export const config = {
  maxDuration: 300,
};

const GOOGLE_SUBMISSION_HELP =
  "Verify GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, " +
  "GOOGLE_SEARCH_CONSOLE_SITE_URL, and Search Console property access for the service account.";

export default async function refreshSitemap(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // read the bearer token supplied by vercel cron or a manual test caller.
  const authHeader = req.headers.authorization;

  // this shared secret is how we decide whether the caller is allowed to trigger refreshes.
  const expectedSecret = process.env.CRON_SECRET;

  // reject any request that does not provide the expected bearer token.
  //
  // note: vercel cron automatically includes an "Authorization: Bearer <CRON_SECRET>"
  // header if the CRON_SECRET environment variable is configured in the project.
  // if this consistently returns 401, verify that CRON_SECRET is set in vercel.
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({
      ok: false,
      message: "Unauthorized - Check CRON_SECRET configuration",
    });
  }

  // limit the endpoint to get requests because vercel cron calls it with get and
  // we do not need extra method surface area here.
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    // step 1: generate a fresh sitemap snapshot from current wordpress data.
    // if this fails, we return 500 and do not attempt google submission.
    const result = await refreshSitemapSnapshot();

    // this object reports whether the post-refresh google submission was attempted
    // and whether it succeeded, but it does not control the success of the sitemap refresh itself.
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

    // step 2: only after the refresh succeeds, try to submit the sitemap url to
    // google search console so google knows to fetch the updated sitemap again.
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
        console.error("Google Search Console sitemap submission failed:", error, GOOGLE_SUBMISSION_HELP);

        // do not fail the cron request here.
        // the sitemap refresh already succeeded, and google submission should remain
        // an optional follow-up step rather than a blocker.
        searchConsole = {
          submitted: false,
          message:
            error instanceof Error
              ? `${error.message} ${GOOGLE_SUBMISSION_HELP}`
              : `Google Search Console sitemap submission failed. ${GOOGLE_SUBMISSION_HELP}`,
        };
      }
    } else {
      // skip the google step entirely if the required env vars are not configured.
      searchConsole = {
        submitted: false,
        skipped: true,
        message: "Google Search Console submission is not configured",
      };
    }

    return res.status(200).json({
      // this means the sitemap refresh itself succeeded.
      ok: true,

      // how many final urls were generated into the refreshed sitemap.
      entryCount: result.entryCount,

      // when the refreshed sitemap snapshot was generated.
      generatedAt: result.generatedAt,

      // nested status for the optional google submission step.
      searchConsole,
    });
  } catch (error) {
    console.error(
      "Scheduled sitemap refresh failed. Next step: verify WordPress GraphQL reachability and WORDPRESS_API_URL, confirm CRON_SECRET is configured correctly, inspect preceding crawl logs, or rerun this endpoint manually:",
      error
    );

    // only core refresh failures should produce a 500 here.
    // google submission failures are handled above and should not reach this block.
    return res.status(500).json({
      ok: false,
      message: "Sitemap refresh failed",
    });
  }
}
