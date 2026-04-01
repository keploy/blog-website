import { SITE_URL } from "./structured-data";
import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";

const WP_API_URL =
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  "https://wp.keploy.io/graphql";

type SitemapChangeFrequency = "daily" | "weekly" | "monthly";

export type SitemapEntry = {
  url: string;
  lastModified?: string;
  changeFrequency?: SitemapChangeFrequency;
  priority?: number;
};

type CategoryRoute = "technology" | "community";

type SitemapPost = {
  slug: string;
  modified?: string;
  authorName?: string;
  tags: string[];
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type PostsQueryResponse = {
  posts?: {
    edges?: Array<{
      node?: {
        slug?: string;
        modified?: string;
        ppmaAuthorName?: string;
        tags?: {
          edges?: Array<{
            node?: {
              name?: string;
            };
          }>;
        };
      };
    }>;
    pageInfo?: {
      hasNextPage?: boolean;
      endCursor?: string | null;
    };
  };
};

const STATIC_ROUTES: Array<Omit<SitemapEntry, "lastModified">> = [
  { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
  { url: `${SITE_URL}/technology`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/authors`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/tag`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.6 },
  { url: `${SITE_URL}/community/search`, changeFrequency: "weekly", priority: 0.6 },
];

async function fetchGraphQL<T>(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(WP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`WordPress GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    const message = json.errors.map((error) => error.message).filter(Boolean).join(", ");
    throw new Error(message || "WordPress GraphQL returned errors");
  }

  if (!json.data) {
    throw new Error("WordPress GraphQL returned no data");
  }

  return json.data;
}

async function fetchAllPostsByCategory(categoryName: CategoryRoute) {
  const posts: SitemapPost[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const data = await fetchGraphQL<PostsQueryResponse>(
      `
        query SitemapPosts($categoryName: String!, $after: String) {
          posts(
            first: 100
            after: $after
            where: {
              categoryName: $categoryName
              orderby: { field: MODIFIED, order: DESC }
            }
          ) {
            edges {
              node {
                slug
                modified
                ppmaAuthorName
                tags {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      { after, categoryName }
    );

    const edges = data.posts?.edges || [];

    for (const edge of edges) {
      const node = edge?.node;
      if (!node?.slug) {
        continue;
      }

      posts.push({
        slug: node.slug,
        modified: node.modified,
        authorName: node.ppmaAuthorName,
        tags:
          node.tags?.edges
            ?.map((tagEdge) => tagEdge?.node?.name?.trim())
            .filter((tagName): tagName is string => Boolean(tagName)) || [],
      });
    }

    hasNextPage = Boolean(data.posts?.pageInfo?.hasNextPage);
    after = data.posts?.pageInfo?.endCursor || null;
  }

  return posts;
}

async function safeFetchAllPostsByCategory(categoryName: CategoryRoute) {
  try {
    return await fetchAllPostsByCategory(categoryName);
  } catch (error) {
    console.error(`Sitemap fetch failed for category "${categoryName}":`, error);
    return [];
  }
}

function toIsoDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function isRecent(dateValue?: string, days = 30) {
  const isoDate = toIsoDate(dateValue);
  if (!isoDate) {
    return false;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return new Date(isoDate) >= cutoff;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function dedupeEntries(entries: SitemapEntry[]) {
  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());
}

function getLatestModified(posts: SitemapPost[]) {
  return posts.reduce<string | undefined>((latest, post) => {
    const current = toIsoDate(post.modified);
    if (!current) {
      return latest;
    }

    if (!latest || current > latest) {
      return current;
    }

    return latest;
  }, undefined);
}

function buildPostEntries(posts: SitemapPost[], route: CategoryRoute): SitemapEntry[] {
  return posts
    .filter((post) => Boolean(post.slug))
    .map((post) => ({
      url: `${SITE_URL}/${route}/${encodeURIComponent(post.slug)}`,
      lastModified: toIsoDate(post.modified),
      changeFrequency: "weekly" as const,
      priority: isRecent(post.modified) ? 0.8 : 0.5,
    }));
}

function buildAuthorEntries(posts: SitemapPost[]): SitemapEntry[] {
  const authorMap = new Map<string, string | undefined>();

  for (const post of posts) {
    const authorName = post.authorName?.trim();
    if (!authorName) {
      continue;
    }

    const authorSlug = sanitizeAuthorSlug(authorName);
    if (!authorSlug) {
      continue;
    }

    const currentModified = toIsoDate(post.modified);
    const existingModified = authorMap.get(authorSlug);

    if (!existingModified || (currentModified && currentModified > existingModified)) {
      authorMap.set(authorSlug, currentModified);
    }
  }

  return Array.from(authorMap.entries()).map(([authorSlug, lastModified]) => ({
    url: `${SITE_URL}/authors/${authorSlug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

function buildTagEntries(posts: SitemapPost[]): SitemapEntry[] {
  const tagMap = new Map<string, string | undefined>();

  for (const post of posts) {
    const postModified = toIsoDate(post.modified);

    for (const tagName of post.tags) {
      const normalizedTag = tagName.trim();
      if (!normalizedTag) {
        continue;
      }

      const existingModified = tagMap.get(normalizedTag);
      if (!existingModified || (postModified && postModified > existingModified)) {
        tagMap.set(normalizedTag, postModified);
      }
    }
  }

  return Array.from(tagMap.entries()).map(([tagName, lastModified]) => ({
    url: `${SITE_URL}/tag/${encodeURIComponent(tagName)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

export async function getSitemapEntries() {
  // Fetch sequentially to reduce burst pressure on WPGraphQL and keep sitemap generation resilient.
  const technologyPosts = await safeFetchAllPostsByCategory("technology");
  const communityPosts = await safeFetchAllPostsByCategory("community");

  const allPosts = [...technologyPosts, ...communityPosts];
  const latestPostModified = getLatestModified(allPosts) || new Date().toISOString();

  const staticEntries = STATIC_ROUTES.map((entry) => ({
    ...entry,
    lastModified: latestPostModified,
  }));

  const entries = [
    ...staticEntries,
    ...buildPostEntries(technologyPosts, "technology"),
    ...buildPostEntries(communityPosts, "community"),
    ...buildAuthorEntries(allPosts),
    ...buildTagEntries(allPosts),
  ];

  return dedupeEntries(entries);
}

export function serializeSitemap(entries: SitemapEntry[]) {
  const body = entries
    .map((entry) => {
      const parts = [
        `<loc>${escapeXml(entry.url)}</loc>`,
        entry.lastModified ? `<lastmod>${escapeXml(entry.lastModified)}</lastmod>` : "",
        entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : "",
        typeof entry.priority === "number" ? `<priority>${entry.priority.toFixed(1)}</priority>` : "",
      ].filter(Boolean);

      return `<url>${parts.join("")}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export async function generateSitemapXml() {
  const entries = await getSitemapEntries();
  return serializeSitemap(entries);
}
