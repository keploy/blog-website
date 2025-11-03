import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

async function fetchAPI(query: string, variables?: Record<string, any>) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`;
  }
  const res = await fetch(API_URL as string, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch WPGraphQL");
  }
  return json.data;
}

const QUERY = `
  query SearchIndex($after: String) {
    posts(first: 50, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
      edges {
        node {
          title
          slug
          ppmaAuthorName
          author { node { name } }
          categories { edges { node { name } } }
          tags { edges { node { name } } }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let after: string | null = null;
    let hasNextPage = true;
    const items: any[] = [];

    while (hasNextPage) {
      const data = await fetchAPI(QUERY, { after });
      const edges = data?.posts?.edges ?? [];
      for (const { node } of edges) {
        const categories = (node.categories?.edges ?? []).map((e: any) => e.node?.name).filter(Boolean);
        const tags = (node.tags?.edges ?? []).map((e: any) => e.node?.name).filter(Boolean);
        items.push({
          title: node.title,
          slug: node.slug,
          author: node.ppmaAuthorName || node.author?.node?.name || "Anonymous",
          tags,
          categories,
          isCommunity: categories.includes("community"),
        });
      }
      hasNextPage = data?.posts?.pageInfo?.hasNextPage ?? false;
      after = data?.posts?.pageInfo?.endCursor ?? null;
    }

    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=86400");
    res.status(200).json({ items });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Internal error" });
  }
}


