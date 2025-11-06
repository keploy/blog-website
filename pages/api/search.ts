import type { NextApiRequest, NextApiResponse } from "next";
import { getAllPostsForCommunity, getAllPostsForTechnology } from "../../lib/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    if (!q) {
      return res.status(200).json({ results: [] });
    }

    const [community, technology] = await Promise.all([
      getAllPostsForCommunity(false),
      getAllPostsForTechnology(false),
    ]);

    const combined = [
      ...(community?.edges || []),
      ...(technology?.edges || []),
    ];

    const results = combined.filter(({ node }) => {
      const title = (node?.title || "").toLowerCase();
      const excerpt = (node?.excerpt || "").toLowerCase();
      return title.includes(q) || excerpt.includes(q);
    }).slice(0, 20);

    return res.status(200).json({ results });
  } catch (e) {
    console.error("/api/search failed", e);
    return res.status(500).json({ error: "Search failed" });
  }
}


