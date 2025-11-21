import type { NextApiRequest, NextApiResponse } from "next";
import { getAllPostsForCommunity, getAllPostsForTechnology } from "../../lib/api";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const [tech, comm] = await Promise.all([
      getAllPostsForTechnology(false),
      getAllPostsForCommunity(false),
    ]);
    res.status(200).json({
      technology: (tech?.edges || []).slice(0, 4),
      community: (comm?.edges || []).slice(0, 4),
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to load latest posts" });
  }
}


