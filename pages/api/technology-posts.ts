import type { NextApiRequest, NextApiResponse } from "next";
import { getAllTechnologyPosts, getTechnologyPostsByPage } from "../../lib/api";
import { Post } from "../../types/post";

const dedupePosts = (posts: Post[] = []) => {
  const seen = new Set<string>();
  return posts.filter((post) => {
    if (!post?.slug) return false;
    if (seen.has(post.slug)) return false;
    seen.add(post.slug);
    return true;
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
  const firstParam = Array.isArray(req.query.first) ? req.query.first[0] : req.query.first;
  const modeParam = Array.isArray(req.query.mode) ? req.query.mode[0] : req.query.mode;
  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = Math.max(1, Math.min(Number(firstParam) || 18, 50));

  try {
    if (modeParam === "all") {
      const posts = await getAllTechnologyPosts(false);
      const uniquePosts = dedupePosts(posts);
      res.status(200).json({ posts: uniquePosts, total: uniquePosts.length });
      return;
    }

    const data = await getTechnologyPostsByPage(page, pageSize, false);
    res.status(200).json(data);
  } catch (error) {
    console.error("pages/api/technology-posts error:", error);
    res.status(500).json({ error: "Failed to load technology posts" });
  }
}

