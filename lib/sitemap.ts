import { getAllPostsForCommunity, getAllPostsForTechnology, getAllTags } from "./api";
import { SITE_URL } from "./structured-data";
import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";

type PostEdge = {
  node: {
    slug?: string;
    date?: string;
    ppmaAuthorName?: string;
  };
};

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
};

type PaginatedPostsResponse = {
  edges?: PostEdge[];
  pageInfo?: {
    hasNextPage?: boolean;
    endCursor?: string | null;
  };
};

const STATIC_ROUTES: SitemapEntry[] = [
  { loc: SITE_URL, changefreq: "daily", priority: 1.0 },
  { loc: `${SITE_URL}/technology`, changefreq: "daily", priority: 0.9 },
  { loc: `${SITE_URL}/community`, changefreq: "daily", priority: 0.9 },
  { loc: `${SITE_URL}/authors`, changefreq: "weekly", priority: 0.8 },
  { loc: `${SITE_URL}/tag`, changefreq: "weekly", priority: 0.8 },
  { loc: `${SITE_URL}/search`, changefreq: "weekly", priority: 0.6 },
  { loc: `${SITE_URL}/community/search`, changefreq: "weekly", priority: 0.6 },
];

async function getAllCategoryPosts(
  fetchPage: (preview?: boolean, after?: string | null) => Promise<PaginatedPostsResponse>
) {
  const edges: PostEdge[] = [];
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const page = await fetchPage(false, after);
    edges.push(...(page?.edges || []));
    hasNextPage = Boolean(page?.pageInfo?.hasNextPage);
    after = page?.pageInfo?.endCursor || null;
  }

  return edges;
}

function toIsoDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
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
  return Array.from(new Map(entries.map((entry) => [entry.loc, entry])).values());
}

export async function getSitemapEntries() {
  const [technologyPosts, communityPosts, tags] = await Promise.all([
    getAllCategoryPosts(getAllPostsForTechnology),
    getAllCategoryPosts(getAllPostsForCommunity),
    getAllTags(),
  ]);

  const allPosts = [...technologyPosts, ...communityPosts];
  const latestPostDate = allPosts.reduce<string | undefined>((latest, edge) => {
    const current = toIsoDate(edge?.node?.date);
    if (!current) {
      return latest;
    }

    if (!latest || current > latest) {
      return current;
    }

    return latest;
  }, undefined);

  const postEntries: SitemapEntry[] = [
    ...technologyPosts.map(({ node }) => ({
      loc: `${SITE_URL}/technology/${encodeURIComponent(node.slug || "")}`,
      lastmod: toIsoDate(node.date),
      changefreq: "weekly" as const,
      priority: 0.8,
    })),
    ...communityPosts.map(({ node }) => ({
      loc: `${SITE_URL}/community/${encodeURIComponent(node.slug || "")}`,
      lastmod: toIsoDate(node.date),
      changefreq: "weekly" as const,
      priority: 0.8,
    })),
  ].filter((entry) => !entry.loc.endsWith("/"));

  const authorEntries: SitemapEntry[] = Array.from(
    new Set(
      allPosts
        .map(({ node }) => node?.ppmaAuthorName)
        .filter((authorName): authorName is string => Boolean(authorName?.trim()))
        .map((authorName) => sanitizeAuthorSlug(authorName))
        .filter(Boolean)
    )
  ).map((authorSlug) => ({
    loc: `${SITE_URL}/authors/${authorSlug}`,
    changefreq: "weekly",
    priority: 0.7,
  }));

  const tagEntries: SitemapEntry[] = (tags || [])
    .map((tag) => tag?.name)
    .filter((tagName): tagName is string => Boolean(tagName?.trim()))
    .map((tagName) => ({
      loc: `${SITE_URL}/tag/${encodeURIComponent(tagName)}`,
      changefreq: "weekly" as const,
      priority: 0.7,
    }));

  const staticEntries = STATIC_ROUTES.map((entry) => ({
    ...entry,
    lastmod: latestPostDate,
  }));

  return dedupeEntries([...staticEntries, ...postEntries, ...authorEntries, ...tagEntries]);
}

export async function generateSitemapXml() {
  const entries = await getSitemapEntries();

  const body = entries
    .map((entry) => {
      const parts = [
        `<loc>${escapeXml(entry.loc)}</loc>`,
        entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "",
        entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : "",
        typeof entry.priority === "number" ? `<priority>${entry.priority.toFixed(1)}</priority>` : "",
      ].filter(Boolean);

      return `<url>${parts.join("")}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}
