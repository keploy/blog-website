import { promises as fs } from "fs";
import path from "path";
import { SITE_URL } from "./structured-data";
import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";

const WP_API_URL =
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  "https://wp.keploy.io/graphql";

const SITEMAP_SNAPSHOT_PATH = path.join("/tmp", "keploy-blog-sitemap.xml");
const FETCH_RETRY_LIMIT = 6;
const FETCH_RETRY_DELAY_MS = 2000;
const FETCH_TIMEOUT_MS = 25000;
const POSTS_PAGE_SIZE = 50;
const PAGE_SETTLE_DELAY_MS = 250;

type SitemapChangeFrequency = "daily" | "weekly" | "monthly";
type CategoryRoute = "technology" | "community";

export type SitemapEntry = {
  url: string;
  lastModified?: string;
  changeFrequency?: SitemapChangeFrequency;
  priority?: number;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type SitemapPost = {
  slug: string;
  modified?: string;
  authorName?: string;
  tags: string[];
  routes: CategoryRoute[];
};

type AllPostsQueryResponse = {
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
        categories?: {
          edges?: Array<{
            node?: {
              name?: string;
              slug?: string;
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

let lastSuccessfulSitemapXml: string | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number) {
  return [408, 429, 500, 502, 503, 504].includes(status);
}

async function fetchGraphQL<T>(query: string, variables: Record<string, unknown> = {}) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= FETCH_RETRY_LIMIT; attempt += 1) {
    try {
      const response = await fetch(WP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!response.ok) {
        if (isRetryableStatus(response.status) && attempt < FETCH_RETRY_LIMIT) {
          await sleep(FETCH_RETRY_DELAY_MS * attempt);
          continue;
        }

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
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < FETCH_RETRY_LIMIT) {
        await sleep(FETCH_RETRY_DELAY_MS * attempt);
        continue;
      }
    }
  }

  throw lastError || new Error("WordPress GraphQL request failed");
}

function mapCategoriesToRoutes(
  categories?: AllPostsQueryResponse["posts"]["edges"][number]["node"]["categories"]
) {
  const routes = new Set<CategoryRoute>();

  for (const edge of categories?.edges || []) {
    const slug = edge?.node?.slug?.trim()?.toLowerCase();
    const name = edge?.node?.name?.trim()?.toLowerCase();

    if (slug === "technology" || name === "technology") {
      routes.add("technology");
    }

    if (slug === "community" || name === "community") {
      routes.add("community");
    }
  }

  return Array.from(routes);
}

async function fetchAllPosts() {
  const posts: SitemapPost[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const data = await fetchGraphQL<AllPostsQueryResponse>(
      `
        query SitemapPosts($after: String) {
          posts(
            first: ${POSTS_PAGE_SIZE}
            after: $after
            where: {
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
                categories {
                  edges {
                    node {
                      name
                      slug
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
      { after }
    );

    const edges = data.posts?.edges || [];

    for (const edge of edges) {
      const node = edge?.node;
      if (!node?.slug) {
        continue;
      }

      const routes = mapCategoriesToRoutes(node.categories);
      if (!routes.length) {
        continue;
      }

      posts.push({
        slug: node.slug,
        modified: node.modified,
        authorName: node.ppmaAuthorName,
        routes,
        tags:
          node.tags?.edges
            ?.map((tagEdge) => tagEdge?.node?.name?.trim())
            .filter((tagName): tagName is string => Boolean(tagName)) || [],
      });
    }

    hasNextPage = Boolean(data.posts?.pageInfo?.hasNextPage);
    after = data.posts?.pageInfo?.endCursor || null;

    if (hasNextPage) {
      await sleep(PAGE_SETTLE_DELAY_MS);
    }
  }

  return posts;
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

function buildPostEntries(posts: SitemapPost[]) {
  return posts.flatMap((post) =>
    post.routes.map((route) => ({
      url: `${SITE_URL}/${route}/${encodeURIComponent(post.slug)}`,
      lastModified: toIsoDate(post.modified),
      changeFrequency: "weekly" as const,
      priority: isRecent(post.modified) ? 0.8 : 0.5,
    }))
  );
}

function buildAuthorEntries(posts: SitemapPost[]) {
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
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}

function buildTagEntries(posts: SitemapPost[]) {
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
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}

function assertFullSitemap(posts: SitemapPost[]) {
  if (!posts.length) {
    throw new Error("Sitemap generation returned zero posts");
  }

  const technologyCount = posts.filter((post) => post.routes.includes("technology")).length;
  const communityCount = posts.filter((post) => post.routes.includes("community")).length;

  if (!technologyCount || !communityCount) {
    throw new Error(
      `Sitemap generation incomplete: technology=${technologyCount}, community=${communityCount}`
    );
  }
}

export async function getSitemapEntries() {
  const posts = await fetchAllPosts();
  assertFullSitemap(posts);

  const latestPostModified = getLatestModified(posts) || new Date().toISOString();
  const staticEntries = STATIC_ROUTES.map((entry) => ({
    ...entry,
    lastModified: latestPostModified,
  }));

  return dedupeEntries([
    ...staticEntries,
    ...buildPostEntries(posts),
    ...buildAuthorEntries(posts),
    ...buildTagEntries(posts),
  ]);
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

async function readPersistedSitemapSnapshot() {
  try {
    return await fs.readFile(SITEMAP_SNAPSHOT_PATH, "utf8");
  } catch {
    return null;
  }
}

async function persistSitemapSnapshot(xml: string) {
  try {
    await fs.writeFile(SITEMAP_SNAPSHOT_PATH, xml, "utf8");
  } catch (error) {
    console.error("Failed to persist sitemap snapshot:", error);
  }
}

export async function generateSitemapXml() {
  try {
    const entries = await getSitemapEntries();
    const xml = serializeSitemap(entries);

    lastSuccessfulSitemapXml = xml;
    await persistSitemapSnapshot(xml);

    return xml;
  } catch (error) {
    console.error("Fresh sitemap generation failed, trying last successful snapshot:", error);

    if (lastSuccessfulSitemapXml) {
      return lastSuccessfulSitemapXml;
    }

    const persistedSnapshot = await readPersistedSitemapSnapshot();
    if (persistedSnapshot) {
      lastSuccessfulSitemapXml = persistedSnapshot;
      return persistedSnapshot;
    }

    throw error;
  }
}
