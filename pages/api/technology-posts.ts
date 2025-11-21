import type { NextApiRequest, NextApiResponse } from "next";
import { getTechnologyPostsByPage } from "../../lib/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
  const firstParam = Array.isArray(req.query.first) ? req.query.first[0] : req.query.first;
  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = Math.max(1, Math.min(Number(firstParam) || 21, 50));

  try {
    const data = await getTechnologyPostsByPage(page, pageSize, false);
    res.status(200).json(data);
  } catch (error) {
    console.error("pages/api/technology-posts error:", error);
    res.status(500).json({ error: "Failed to load technology posts" });
  }
}

