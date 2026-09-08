import type { NextApiRequest, NextApiResponse } from "next";
import { getAllPostsForCommunity, getAllPostsForTechnology } from "../../lib/api";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const [community, technology] = await Promise.all([
      getAllPostsForCommunity(false),
      getAllPostsForTechnology(false),
    ]);

    const results = [
      ...(community?.edges || []),
      ...(technology?.edges || []),
    ];

    // Public, identical for every visitor. Without this the search box burned a
    // serverless invocation (two WordPress queries) every time a user opened it.
    // Served from the edge instead, and refreshed in the background thereafter.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    res.status(200).json({ results });
  } catch (e) {
    console.error("/api/search-all failed", e);
    // Never cache a failure. Without this the error falls through to the
    // blanket /blog/(.*) rule in vercel.json and a transient WordPress blip
    // gets pinned in visitors' browsers for an hour.
    res.setHeader("Cache-Control", "no-store");
    res.status(500).json({ error: "Failed to load posts" });
  }
}


