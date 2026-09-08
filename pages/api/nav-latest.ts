import type { NextApiRequest, NextApiResponse } from "next";
import { getAllPostsForCommunity, getAllPostsForTechnology } from "../../lib/api";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const [tech, comm] = await Promise.all([
      getAllPostsForTechnology(false),
      getAllPostsForCommunity(false),
    ]);
    // Public, identical for every visitor — cache at the edge so this costs a
    // function invocation once an hour rather than once per navbar render.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    res.status(200).json({
      technology: (tech?.edges || []).slice(0, 4),
      community: (comm?.edges || []).slice(0, 4),
    });
  } catch (e: any) {
    // Never cache a failure — see the note in search-all.ts.
    res.setHeader("Cache-Control", "no-store");
    res.status(500).json({ error: e?.message || "Failed to load latest posts" });
  }
}


