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

    res.status(200).json({ results });
  } catch (e) {
    console.error("/api/search-all failed", e);
    res.status(500).json({ error: "Failed to load posts" });
  }
}


