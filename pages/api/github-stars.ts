import type { NextApiRequest, NextApiResponse } from "next";

type GithubRepoResponse = {
  stargazers_count?: number;
};

type Data = {
  stars: number;
  cachedAt: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: string }>
) {
  try {
    const apiRes = await fetch("https://api.github.com/repos/keploy/keploy", {
      headers: {
        "User-Agent": "keploy-blog",
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: "Failed to fetch stars" });
    }

    const data: GithubRepoResponse = await apiRes.json();
    const stars = typeof data.stargazers_count === "number" ? data.stargazers_count : 0;

    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
    return res.status(200).json({ stars, cachedAt: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected error" });
  }
}


