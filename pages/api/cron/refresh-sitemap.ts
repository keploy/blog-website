import type { NextApiRequest, NextApiResponse } from "next";
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

    return res.status(200).json({
      ok: true,
      entryCount: result.entryCount,
      generatedAt: result.generatedAt,
    });
  } catch (error) {
    console.error("Scheduled sitemap refresh failed:", error);

    return res.status(500).json({
      ok: false,
      message: "Sitemap refresh failed",
    });
  }
}
