import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { SITE_URL } from "./structured-data";
import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";
import { sanitizeStringForURL } from "../utils/sanitizeStringForUrl";

// choose the wordpress graphql endpoint in this order:
// server-only env for production or local server use
// public env as a fallback if the server env is missing
// hardcoded endpoint so local development still works out of the box

// this value is the single source used for every wordpress fetch in the sitemap flow.
const WP_API_URL =
  process.env.WORDPRESS_API_URL ||
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  "https://wp.keploy.io/graphql";

// store the last successful xml in /tmp so a later failed refresh can fall back to it
// this is runtime local storage, not durable database storage, so it helps during the
// life of a runtime instance but is not guaranteed across instance replacement
const SITEMAP_SNAPSHOT_PATH = path.join(os.tmpdir(), "keploy-blog-sitemap.xml");

// how many times a single wordpress request can be retried before failing.
const FETCH_RETRY_LIMIT = 6;

// base retry delay in milliseconds. the actual wait grows with each attempt.
const FETCH_RETRY_DELAY_MS = 2000;

// fail a single wordpress request if it hangs too long.
const FETCH_TIMEOUT_MS = 25000;

// fetch posts in pages of 50 to avoid overloading wordpress with huge payloads.
const POSTS_PAGE_SIZE = 50;

// wait briefly between pages so the crawl is less aggressive on wpgraphql.
const PAGE_SETTLE_DELAY_MS = 250;

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

type GraphQLResponse<T> = {
  // graphql returns successful payloads under data.
  data?: T;

  // graphql can also return logical errors even when the http request itself succeeded.
  errors?: Array<{ message?: string }>;
};

type SitemapPost = {
  // wordpress post slug used to build the frontend url.
  slug: string;

  // wordpress last updated timestamp for the post.
  modified?: string;

  // author name returned by wordpress for this post.
  authorName?: string;

  // tag names attached to the post.
  tags: string[];

  // local route namespaces this post belongs to after category mapping.
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

type PostNode = NonNullable<
  NonNullable<NonNullable<AllPostsQueryResponse["posts"]>["edges"]>[number]["node"]
>;

const STATIC_ROUTES: Array<Omit<SitemapEntry, "lastModified">> = [
  // top-level listing and navigation pages that should always be in the sitemap.
  { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
  { url: `${SITE_URL}/technology`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/authors`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/tag`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.6 },
  { url: `${SITE_URL}/community/search`, changeFrequency: "weekly", priority: 0.6 },
];

// keep the latest successful sitemap in memory so request-time fallback is instant
// when the same runtime handles a later failure.
let lastSuccessfulSitemapXml: string | null = null;

// hold the in-flight refresh promise so concurrent callers share one crawl instead
// of each starting an independent wordpress fetch sequence.
let refreshSitemapPromise: Promise<SitemapRefreshResult> | null = null;

export type SitemapRefreshResult = {
  entryCount: number;
  generatedAt: string;
  xml: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// retry statuses that are commonly temporary:
// - timeouts
// - rate limits
// - transient upstream/server failures
function isRetryableStatus(status: number) {
  return [408, 429, 500, 502, 503, 504].includes(status);
}

class RetryableFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableFetchError";
  }
}

function isRetryableRequestError(error: unknown) {
  if (error instanceof RetryableFetchError) {
    return true;
  }

  if (error instanceof Error) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return true;
    }

    if (error instanceof TypeError) {
      return true;
    }
  }

  return false;
}

async function fetchGraphQL<T>(query: string, variables: Record<string, unknown> = {}) {
  // remember the last seen error so the final thrown error is meaningful.
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= FETCH_RETRY_LIMIT; attempt += 1) {
    try {
      // send the graphql request to wordpress.
      //
      // the body contains:
      // - query: the graphql query string
      // - variables: query variables such as the pagination cursor
      //
      // the abort signal enforces a hard timeout for the request.
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
          throw new RetryableFetchError(
            `WordPress GraphQL request failed with retryable status: ${response.status} ${response.statusText}`
          );
        }

        // for non-retryable failures, or when retries are exhausted, fail immediately.
        throw new Error(`WordPress GraphQL request failed: ${response.status} ${response.statusText}`);
      }

      // parse the graphql response body after http success.
      const json = (await response.json()) as GraphQLResponse<T>;

      if (json.errors?.length) {
        // graphql can return application-level errors even when the http response is 200.
        const message = json.errors.map((error) => error.message).filter(Boolean).join(", ");
        const graphqlErrorMessage = message || "WordPress GraphQL returned errors";

        // treat graphql-level errors as retryable while attempts remain because
        // wpgraphql can return transient errors (e.g. during plugin reload or db lock)
        // with a 200 http response. failing immediately on first occurrence would miss
        // these cases that the retry loop is specifically designed to handle.
        if (attempt < FETCH_RETRY_LIMIT) {
          throw new RetryableFetchError(graphqlErrorMessage);
        }
        throw new Error(graphqlErrorMessage);
      }

      if (!json.data) {
        // a graphql response without data is not useful for sitemap generation.
        throw new Error("WordPress GraphQL returned no data");
      }

      // success path: return the typed graphql data.
      return json.data;
    } catch (error) {
      // normalize unknown thrown values into an Error instance.
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < FETCH_RETRY_LIMIT && isRetryableRequestError(error)) {
        // retry only transient failures (network/timeout/retryable upstream statuses).
        await sleep(FETCH_RETRY_DELAY_MS * attempt);
        continue;
      }

      // fail fast for non-retryable errors and once retry attempts are exhausted.
      throw lastError;
    }
  }

  throw lastError || new Error("WordPress GraphQL request failed");
}

function mapCategoriesToRoutes(categories?: PostNode["categories"]) {
  // use a set so one post cannot produce duplicate routes even if wordpress returns
  // the same category in multiple forms.
  const routes = new Set<CategoryRoute>();

  for (const edge of categories?.edges || []) {
    const slug = edge?.node?.slug?.trim()?.toLowerCase();
    const name = edge?.node?.name?.trim()?.toLowerCase();

    // map wordpress category data to real frontend route namespaces.
    //
    // we support matching by either slug or name because wordpress content can be
    // inconsistent across environments or editorial changes.
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
  // collect only the posts that are eligible for sitemap inclusion.
  const posts: SitemapPost[] = [];

  // graphql cursor pagination state.
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    // fetch one page at a time from wordpress.
    //
    // query design:
    // - first: 50 keeps payload size reasonable
    // - after: cursor for the next page
    // - orderby modified desc: newer posts are returned first
    //
    // fields requested:
    // - slug: needed to build the final frontend url
    // - modified: used to build sitemap lastmod
    // - ppmaAuthorName: used to derive author archive urls
    // - tags: used to derive tag archive urls from included posts
    // - categories: used to map a wordpress post to technology/community routes
    // - pageInfo: needed to continue pagination until every post is processed
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
        // skip malformed wordpress records that do not have a usable slug.
        continue;
      }

      // decide whether this wordpress post belongs to a supported sitemap route.
      // if the categories do not map to technology/community, the post is excluded.
      const routes = mapCategoriesToRoutes(node.categories);
      if (!routes.length) {
        continue;
      }

      // store the minimum data needed for later sitemap entry generation.
      //
      // note that we keep author and tag data here instead of running separate
      // wordpress queries, because we only want author/tag pages backed by the
      // exact set of posts that passed our inclusion rules.
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
      // insert a small delay before fetching the next page to reduce pressure on wpgraphql.
      await sleep(PAGE_SETTLE_DELAY_MS);
    }
  }

  // return the full eligible post set after every page has been processed.
  return posts;
}

function toIsoDate(value?: string) {
  if (!value) {
    return undefined;
  }

  // convert the wordpress date string into a normalized iso string.
  // why this exists:
  // - wordpress may return a parseable date string format
  // - the sitemap should emit a consistent machine-readable timestamp
  // - invalid dates should quietly disappear instead of producing bad xml
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
  // escape xml-sensitive characters so urls and timestamps cannot break the xml document.
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function dedupeEntries(entries: SitemapEntry[]) {
  // keep only one entry per url in case multiple generation paths produce the same final url.
  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());
}

function getLatestModified(posts: SitemapPost[]) {
  // find the newest modified timestamp across all included posts.
  // this value is later used for high-level listing pages like /blog, /technology,
  // and /community so those pages appear updated when the newest underlying post changes.
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
  // convert each included post into one or more sitemap entries.
  // a single wordpress post can produce multiple urls if it belongs to both
  // technology and community.
  return posts.flatMap((post) =>
    post.routes.map((route) => ({
      // build the absolute public url using the site base url and the route namespace.
      url: `${SITE_URL}/${route}/${encodeURIComponent(post.slug)}`,

      // use the wordpress modified time as the sitemap lastmod.
      lastModified: toIsoDate(post.modified),

      changeFrequency: "weekly" as const,

      // give newer posts slightly higher priority to hint at freshness.
      priority: isRecent(post.modified) ? 0.8 : 0.5,
    }))
  );
}

function buildAuthorEntries(posts: SitemapPost[]) {
  // map author slug -> newest related post modified time.
  const authorMap = new Map<string, string | undefined>();

  for (const post of posts) {
    const authorName = post.authorName?.trim();
    if (!authorName) {
      // skip posts with no usable author name.
      continue;
    }

    // normalize the display name into the frontend author slug format.
    const authorSlug = sanitizeAuthorSlug(authorName);
    if (!authorSlug) {
      continue;
    }

    const currentModified = toIsoDate(post.modified);
    const existingModified = authorMap.get(authorSlug);

    // keep the latest related post modification time so the author page lastmod
    // reflects the freshest content shown on that author page.
    if (!existingModified || (currentModified && currentModified > existingModified)) {
      authorMap.set(authorSlug, currentModified);
    }
  }

  // convert the author map into final sitemap entries.
  return Array.from(authorMap.entries()).map(([authorSlug, lastModified]) => ({
    url: `${SITE_URL}/authors/${authorSlug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}

function buildTagEntries(posts: SitemapPost[]) {
  // map tag name -> newest related post modified time.
  const tagMap = new Map<string, string | undefined>();

  for (const post of posts) {
    const postModified = toIsoDate(post.modified);

    for (const tagName of post.tags) {
      const normalizedTag = tagName.trim();
      if (!normalizedTag) {
        // ignore empty or whitespace-only tag names from wordpress.
        continue;
      }

      const existingModified = tagMap.get(normalizedTag);
      // keep the latest related post modification time so the tag page lastmod
      // tracks the freshest post shown on that tag listing page.
      if (!existingModified || (postModified && postModified > existingModified)) {
        tagMap.set(normalizedTag, postModified);
      }
    }
  }

  // convert the tag map into final sitemap entries.
  return Array.from(tagMap.entries()).flatMap(([tagName, lastModified]) => {
    const tagSlug = sanitizeStringForURL(tagName);
    if (!tagSlug) {
      return [];
    }
    return [{
      url: `${SITE_URL}/tag/${tagSlug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }];
  });
}

// minimum number of posts required per category before the sitemap is considered
// trustworthy enough to publish. this prevents a severely degraded wordpress
// response (e.g. first page only, partial crawl) from replacing a good snapshot.
const MIN_POSTS_PER_CATEGORY = 5;

function assertFullSitemap(posts: SitemapPost[]) {
  // enforce the "no partial publication" rule.
  // if wordpress returns an obviously incomplete crawl, fail the refresh so the
  // app can fall back to the last successful snapshot instead of publishing bad data.
  if (!posts.length) {
    throw new Error("Sitemap generation returned zero posts");
  }

  const technologyCount = posts.filter((post) => post.routes.includes("technology")).length;
  const communityCount = posts.filter((post) => post.routes.includes("community")).length;

  if (technologyCount < MIN_POSTS_PER_CATEGORY || communityCount < MIN_POSTS_PER_CATEGORY) {
    throw new Error(
      `Sitemap generation incomplete: technology=${technologyCount}, community=${communityCount} (minimum ${MIN_POSTS_PER_CATEGORY} required per category)`
    );
  }
}

export async function getSitemapEntries() {
  // crawl all eligible wordpress posts first.
  const posts = await fetchAllPosts();

  // do not continue unless the crawl looks complete enough to trust.
  assertFullSitemap(posts);

  // use the newest included post update time as the lastmod for static listing pages.
  const latestPostModified = getLatestModified(posts) || new Date().toISOString();
  const staticEntries = STATIC_ROUTES.map((entry) => ({
    ...entry,
    lastModified: latestPostModified,
  }));

  // combine every sitemap entry type and dedupe by final url.
  return dedupeEntries([
    ...staticEntries,
    ...buildPostEntries(posts),
    ...buildAuthorEntries(posts),
    ...buildTagEntries(posts),
  ]);
}

export function serializeSitemap(entries: SitemapEntry[]) {
  // turn the structured entry objects into final sitemap xml.

  // this stays manual because:
  // - pages router does not use app router metadata routes
  // - we want full control over xml shape
  // - we explicitly do not want xml comments in the output
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
    const xml = await fs.readFile(SITEMAP_SNAPSHOT_PATH, "utf8");
    // only trust the fallback file if it still looks like a sitemap document.
    return isValidSitemapXml(xml) ? xml : null;
  } catch {
    // treat missing or unreadable snapshot files as "no fallback available".
    return null;
  }
}

function isValidSitemapXml(xml: string) {
  // perform a lightweight sanity check before serving a persisted snapshot.
  // this is not full xml parsing; it only prevents obviously broken files from being used.
  const normalized = xml.trim();

  return (
    normalized.startsWith(`<?xml version="1.0" encoding="UTF-8"?>`) &&
    normalized.includes(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`) &&
    normalized.endsWith(`</urlset>`)
  );
}

async function persistSitemapSnapshot(xml: string) {
  try {
    // write the latest good xml to the runtime-local snapshot path.
    await fs.writeFile(SITEMAP_SNAPSHOT_PATH, xml, "utf8");
  } catch (error) {
    // snapshot persistence is helpful but not critical enough to fail the whole refresh.
    console.error(
      `Failed to persist sitemap snapshot at ${SITEMAP_SNAPSHOT_PATH}. Check that the runtime allows writes to the temp directory and that sufficient permissions and storage are available:`,
      error
    );
  }
}

export async function refreshSitemapSnapshot(): Promise<SitemapRefreshResult> {
  if (!refreshSitemapPromise) {
    refreshSitemapPromise = (async () => {
      // run the full refresh pipeline:
      // 1. fetch wordpress content
      // 2. validate completeness
      // 3. build entries
      // 4. serialize xml
      // 5. save success as the new fallback snapshot
      const entries = await getSitemapEntries();
      const xml = serializeSitemap(entries);

      lastSuccessfulSitemapXml = xml;
      await persistSitemapSnapshot(xml);

      return {
        entryCount: entries.length,
        generatedAt: new Date().toISOString(),
        xml,
      };
    })();

    // once the refresh settles, clear the shared promise so future callers can
    // start a new refresh instead of reusing an old completed one.
    refreshSitemapPromise.finally(() => {
      refreshSitemapPromise = null;
    });
  }

  // if a refresh is already running, every caller waits on the same promise here.
  return refreshSitemapPromise;
}

export async function generateSitemapXml() {
  try {
    // first try to generate a fresh full sitemap from wordpress.
    const result = await refreshSitemapSnapshot();
    return result.xml;
  } catch (error) {
    console.error(
      `Fresh sitemap generation failed; attempting the last successful snapshot. Next steps: verify WORDPRESS_API_URL or NEXT_PUBLIC_WORDPRESS_API_URL is configured correctly and reachable at ${WP_API_URL}, then retry the sitemap refresh once WordPress GraphQL connectivity is restored.`,
      error,
    );

    // first fallback: use the latest successful sitemap held in memory.
    if (lastSuccessfulSitemapXml) {
      return lastSuccessfulSitemapXml;
    }

    // second fallback: use the runtime-local snapshot file if it exists and looks valid.
    const persistedSnapshot = await readPersistedSitemapSnapshot();
    if (persistedSnapshot) {
      lastSuccessfulSitemapXml = persistedSnapshot;
      return persistedSnapshot;
    }

    // if no fallback exists yet, propagate the error to the caller.
    throw error;
  }
}
