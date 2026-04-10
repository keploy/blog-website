import { SITE_URL } from "./structured-data";
import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";
import { sanitizeStringForURL } from "../utils/sanitizeStringForUrl";

type SitemapChangeFrequency = "daily" | "weekly" | "monthly";
type CategoryRoute = "technology" | "community";

export type SitemapEntry = {
  // final absolute url that will appear inside <loc>.
  url: string;

  // final normalized timestamp that will appear inside <lastmod> when available.
  lastModified?: string;

  // optional sitemap hint for crawlers.
  changeFrequency?: SitemapChangeFrequency;

  // optional sitemap hint for relative importance.
  priority?: number;
};

// internal shape used by all entry builders.
// populated via adaptPostsForSitemap() from the getAllPosts() return value.
type SitemapPost = {
  slug: string;
  modified?: string;
  authorName?: string;
  tags: string[];
  routes: CategoryRoute[];
};

export const STATIC_ROUTES: Array<Omit<SitemapEntry, "lastModified">> = [
  // top-level listing and navigation pages that should always be in the sitemap.
  { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
  { url: `${SITE_URL}/technology`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/authors`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/tag`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.6 },
  { url: `${SITE_URL}/community/search`, changeFrequency: "weekly", priority: 0.6 },
];

// minimum posts required per category before the sitemap is considered trustworthy.
// prevents a degraded partial wordpress response from replacing a good cached version.
// override via SITEMAP_MIN_POSTS_PER_CATEGORY — set to 1 in playwright.config.ts so
// playwright fixtures (4 technology / 3 community posts) don't trigger the 503 fallback.
const _parsedMin = parseInt(process.env.SITEMAP_MIN_POSTS_PER_CATEGORY ?? "", 10);
const MIN_POSTS_PER_CATEGORY = Number.isNaN(_parsedMin) ? 5 : _parsedMin;

// maps wordpress category data to the two supported frontend route namespaces.
// matches by both slug and name (lowercased) to handle editorial inconsistencies.
function mapCategoriesToRoutes(categories?: {
  edges?: Array<{ node?: { name?: string; slug?: string } }>;
}): CategoryRoute[] {
  const routes = new Set<CategoryRoute>();

  for (const edge of categories?.edges || []) {
    const slug = edge?.node?.slug?.trim()?.toLowerCase();
    const name = edge?.node?.name?.trim()?.toLowerCase();

    if (slug === "technology" || name === "technology") routes.add("technology");
    if (slug === "community"  || name === "community")  routes.add("community");
  }

  return Array.from(routes);
}

// converts the getAllPosts() return shape into SitemapPost[].
// this is the only coupling point between lib/api.ts and lib/sitemap.ts.
// posts with no matching category route are excluded — same rule as before.
export function adaptPostsForSitemap(allPostsResult: {
  edges: Array<{ node: any }>;
}): SitemapPost[] {
  const posts: SitemapPost[] = [];

  for (const edge of allPostsResult?.edges || []) {
    const node = edge?.node;
    if (!node?.slug) continue;

    const routes = mapCategoriesToRoutes(node.categories);
    if (!routes.length) continue;

    posts.push({
      slug: node.slug,
      modified: node.modified,
      authorName: node.ppmaAuthorName,
      routes,
      tags:
        node.tags?.edges
          ?.map((e: any) => e?.node?.name?.trim())
          .filter((n: unknown): n is string => Boolean(n)) || [],
    });
  }

  return posts;
}

// throws if the crawl looks incomplete, preventing partial data from being cached.
export function assertFullSitemap(posts: SitemapPost[]) {
  if (!posts.length) {
    throw new Error("Sitemap generation returned zero posts");
  }

  const technologyCount = posts.filter((p) => p.routes.includes("technology")).length;
  const communityCount  = posts.filter((p) => p.routes.includes("community")).length;

  if (technologyCount < MIN_POSTS_PER_CATEGORY || communityCount < MIN_POSTS_PER_CATEGORY) {
    throw new Error(
      `Sitemap generation incomplete: technology=${technologyCount}, community=${communityCount} (minimum ${MIN_POSTS_PER_CATEGORY} required per category)`
    );
  }
}

function toIsoDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function isRecent(dateValue?: string, days = 30) {
  const isoDate = toIsoDate(dateValue);
  if (!isoDate) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(isoDate) >= cutoff;
}

// finds the newest modified timestamp across all included posts.
// used to set lastmod on static listing pages so they reflect freshest content.
export function getLatestModified(posts: SitemapPost[]) {
  return posts.reduce<string | undefined>((latest, post) => {
    const current = toIsoDate(post.modified);
    if (!current) return latest;
    if (!latest || current > latest) return current;
    return latest;
  }, undefined);
}

// one entry per post per matching route.
// a post in both technology and community produces two urls.
export function buildPostEntries(posts: SitemapPost[]): SitemapEntry[] {
  return posts.flatMap((post) =>
    post.routes.map((route) => ({
      url: `${SITE_URL}/${route}/${encodeURIComponent(post.slug)}`,
      lastModified: toIsoDate(post.modified),
      changeFrequency: "weekly" as const,
      // posts modified in the last 30 days get higher priority
      priority: isRecent(post.modified) ? 0.8 : 0.5,
    }))
  );
}

// one entry per unique author derived from included posts.
// lastmod is the newest modification time of any post by that author.
export function buildAuthorEntries(posts: SitemapPost[]): SitemapEntry[] {
  const authorMap = new Map<string, string | undefined>();

  for (const post of posts) {
    const authorName = post.authorName?.trim();
    if (!authorName) continue;

    const authorSlug = sanitizeAuthorSlug(authorName);
    if (!authorSlug) continue;

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

// one entry per unique tag derived from included posts.
// lastmod is the newest modification time of any post with that tag.
export function buildTagEntries(posts: SitemapPost[]): SitemapEntry[] {
  const tagMap = new Map<string, string | undefined>();

  for (const post of posts) {
    const postModified = toIsoDate(post.modified);

    for (const tagName of post.tags) {
      const normalizedTag = tagName.trim();
      if (!normalizedTag) continue;

      const existingModified = tagMap.get(normalizedTag);
      if (!existingModified || (postModified && postModified > existingModified)) {
        tagMap.set(normalizedTag, postModified);
      }
    }
  }

  return Array.from(tagMap.entries()).flatMap(([tagName, lastModified]) => {
    const tagSlug = sanitizeStringForURL(tagName);
    if (!tagSlug) return [];
    return [{
      url: `${SITE_URL}/tag/${tagSlug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }];
  });
}

// keeps one entry per url — last writer wins if two paths produce the same url.
export function dedupeEntries(entries: SitemapEntry[]): SitemapEntry[] {
  return Array.from(new Map(entries.map((e) => [e.url, e])).values());
}

// serializes sitemap entries to xml manually — no external library.
// all values are escaped. priority is formatted to one decimal place.
export function serializeSitemap(entries: SitemapEntry[]): string {
  const body = entries
    .map((entry) => {
      const parts = [
        `<loc>${escapeXml(entry.url)}</loc>`,
        entry.lastModified ? `<lastmod>${escapeXml(entry.lastModified)}</lastmod>` : "",
        entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : "",
        typeof entry.priority === "number"
          ? `<priority>${entry.priority.toFixed(1)}</priority>`
          : "",
      ].filter(Boolean);

      return `<url>${parts.join("")}</url>`;
    })
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`
  );
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// last-resort xml served when generation fails with no cached version available.
// contains only the 7 hardcoded static routes — no wordpress data required.
export function getStaticFallbackXml(): string {
  const now = new Date().toISOString();
  return serializeSitemap(
    STATIC_ROUTES.map((route) => ({ ...route, lastModified: now }))
  );
}
