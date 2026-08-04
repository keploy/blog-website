const API_URL = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL

/**
 * Normalize a post node from WordPress — default null title/excerpt to empty
 * strings so downstream consumers never hit null runtime crashes.
 */
function normalizePostNode(node: any): any {
  if (!node) return node;
  return {
    ...node,
    title: node.title ?? '',
    excerpt: node.excerpt ?? '',
  };
}

/** Normalize all post edges in a WPGraphQL response. */
function normalizePostEdges(data: any): any {
  if (data?.posts?.edges) {
    data.posts.edges = data.posts.edges.map((edge: any) => ({
      ...edge,
      node: normalizePostNode(edge.node),
    }));
  }
  if (data?.post) {
    data.post = normalizePostNode(data.post);
  }
  return data;
}

async function fetchAPI(query = "", { variables }: Record<string, any> = {}) {
  const headers = { "Content-Type": "application/json" };

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      "Authorization"
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`;
  }
  // WPGraphQL Plugin must be enabled
  const res = await fetch(API_URL, {
    headers,
    method: "POST",
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }
  return normalizePostEdges(json.data);
}

export async function getPreviewPost(id, idType = "DATABASE_ID") {
  const data = await fetchAPI(
    `
    query PreviewPost($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        databaseId
        slug
        status
      }
    }`,
    {
      variables: { id, idType },
    }
  );
  return data.post;
}

export async function getAllTags() {
  let hasNextPage = true;
  let endCursor = null;
  let allTags = [];

  while (hasNextPage) {
    const data = await fetchAPI(
      `
      query AllTags($first: Int!, $after: String) {
        tags(first: $first, after: $after) {
          edges {
            node {
              name
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
      {
        variables: {
          first: 100, // Adjust as needed
          after: endCursor,
        },
      }
    );

    const tags = data?.tags?.edges.map((edge) => edge.node);
    allTags = allTags.concat(tags);

    hasNextPage = data?.tags?.pageInfo?.hasNextPage;
    endCursor = data?.tags?.pageInfo?.endCursor;
  }
  return allTags;
}

export async function getAllPostsFromTags(tagName: String, preview) {
  const data = await fetchAPI(
    `
    query AllPosts($tagName: String!) {
      posts(first: 100, where: { orderby: { field: DATE, order: DESC }, tag: $tagName }) {
        edges {
          node {
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
              }
            }
            author {
              node {
                name
              }
            }
            ppmaAuthorName
            categories {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
    `,
    {
      variables: {
        tagName,
        onlyEnabled: !preview,
        preview,
      },
    }
  );

  return data?.posts;
}

export async function getAllPosts() {
  let allEdges = [];
  let hasNextPage = true;
  let endCursor = null;

  while (hasNextPage) {
    const data = await fetchAPI(
      `
      query AllPosts($after: String) {
        posts(first: 50, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
          edges {
            node {
              title
              excerpt
              slug
              date
              postId
              featuredImage {
                node {
                  sourceUrl
                }
              }
              author {
                node {
                  name
                }
              }
              ppmaAuthorName
              categories {
                edges {
                  node {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `,
      {
        variables: { after: endCursor },
      }
    );

    const edges = data?.posts?.edges;
    allEdges = [...allEdges, ...edges];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage;
    endCursor = data?.posts?.pageInfo?.endCursor;
  }

  return { edges: allEdges };
}

export async function getContent(postId: number) {
  const data = await fetchAPI(
    `
    query getContent($postId: Int!) {
      postBy(postId: $postId) {
        content
      }
    }
    `,
    {
      variables: {
        postId,
      },
    }
  );

  // Extract and return the content
  return data.postBy.content;
}

//Fetching Reviewing author details

export async function getReviewAuthorDetails(authorName) {
  const data = await fetchAPI(
    `
    query AuthorDetailsByName($authorName: String!) {
      users(where: { search: $authorName }) {
        edges {
          node {
            name
            email
            avatar {
              url
            }
            description
          }
        }
      }
    }
    `,
    {
      variables: {
        authorName,
      },
    }
  );

  return data?.users;
}

/**
 * Process-local memo with a short TTL.
 *
 * Post renders repeat several byte-for-byte identical WordPress queries, and a
 * single build shares one process across hundreds of pages — so memoizing
 * removes almost all of that duplicate work.
 *
 * The TTL is the important part. A warm Vercel lambda is reused across many
 * on-demand regenerations, so a memo with no expiry would serve every
 * webhook-triggered rebuild whatever that lambda happened to cache when it
 * first warmed — meaning a freshly published post could be missing from the
 * "More Stories" rail on newly regenerated pages. Five minutes keeps the
 * dedupe benefit (a build finishes well inside it) while bounding staleness.
 */
const MEMO_TTL_MS = 5 * 60 * 1000;

/** Above this many live keys the memo resets rather than growing unbounded. */
const MEMO_MAX_ENTRIES = 500;

function createMemo<T>(ttlMs: number = MEMO_TTL_MS) {
  type Entry = { value: Promise<T>; expiresAt: number };
  const entries = new Map<string, Entry>();

  return function memo(key: string, produce: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const hit = entries.get(key);
    if (hit && hit.expiresAt > now) return hit.value;

    if (entries.size >= MEMO_MAX_ENTRIES) {
      // forEach rather than for..of: this tsconfig targets below es2015, where
      // iterating a Map needs --downlevelIteration. Deleting during forEach is
      // well-defined for Map.
      entries.forEach((entry, entryKey) => {
        if (entry.expiresAt <= now) entries.delete(entryKey);
      });
      if (entries.size >= MEMO_MAX_ENTRIES) entries.clear();
    }

    // Cache the promise, not the result, so concurrent callers share one
    // request. On failure evict, so the next caller retries instead of pinning
    // a rejection for the whole TTL — but only if we're still the current
    // entry, so a later attempt is never clobbered by an earlier failure.
    const entry = { expiresAt: now + ttlMs } as Entry;
    entry.value = produce().catch((error) => {
      if (entries.get(key) === entry) entries.delete(key);
      throw error;
    });

    entries.set(key, entry);
    return entry.value;
  };
}

/**
 * The two reviewing authors are the same for every single post, but
 * `getReviewAuthorDetails` was being called twice inside every post's
 * getStaticProps — 1.27s of the ~3.5s render budget spent re-fetching two
 * identical, never-changing records.
 */
const reviewAuthorMemo = createMemo<any>();

export function getReviewAuthorDetailsCached(authorName: string) {
  return reviewAuthorMemo(authorName, () => getReviewAuthorDetails(authorName));
}

/** Reviewing authors shown on every post page. */
export const REVIEW_AUTHORS = ["neha", "Jain"];

/** Fetch both reviewing authors, deduped and in parallel. */
export function getReviewAuthors() {
  return Promise.all(REVIEW_AUTHORS.map(getReviewAuthorDetailsCached));
}

/**
 * Every slug in a category, paginating until WordPress runs out.
 *
 * `getAllPostsForTechnology`/`getAllPostsForCommunity` are capped at `first: 22`
 * and were feeding getStaticPaths directly, so only 44 of ~520 posts were ever
 * pre-rendered. The rest fell through to on-demand rendering. This query asks
 * for slugs only, so pages are cheap and 100-at-a-time is safe.
 */
export async function getAllSlugsForCategory(categoryName: string): Promise<string[]> {
  const slugs: string[] = [];
  let after: string | null = null;
  const wanted = categoryName.toLowerCase();

  // Hard page ceiling so a malformed cursor can never spin forever.
  for (let page = 0; page < 100; page++) {
    const data = await fetchAPI(
      `
      query AllSlugsForCategory($after: String, $categoryName: String!) {
        posts(
          first: 100
          after: $after
          where: { orderby: { field: DATE, order: DESC }, categoryName: $categoryName }
        ) {
          edges { node { slug categories { edges { node { name } } } } }
          pageInfo { hasNextPage endCursor }
        }
      }
      `,
      { variables: { after, categoryName } }
    );

    for (const edge of data?.posts?.edges || []) {
      if (!edge?.node?.slug) continue;

      // WPGraphQL's `categoryName` filter matches on the category SLUG, but the
      // page's own guard in getStaticProps compares category NAMES. When those
      // disagree for a post, getStaticProps returns a `redirect` — and Next.js
      // throws "`redirect` can not be returned from getStaticProps during
      // prerendering", failing the whole build.
      //
      // Filtering here on the *same* criterion the page uses makes that
      // unreachable for pre-rendered paths by construction, instead of relying
      // on the old accident that getStaticPaths only ever returned 22 slugs.
      // Genuinely cross-filed posts fall through to fallback: "blocking" and
      // get their 301 at runtime, where returning a redirect is legal.
      const names = (edge.node.categories?.edges || []).map(
        (c: any) => c?.node?.name?.toLowerCase()
      );
      if (!names.includes(wanted)) continue;

      slugs.push(edge.node.slug);
    }

    const pageInfo = data?.posts?.pageInfo;
    if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) break;
    after = pageInfo.endCursor;
  }

  return slugs;
}


// Function for fetching post with technology category
export async function getAllPostsForTechnology(preview = false, after = null) {
  const data = await fetchAPI(
    `
    query AllPostsForCategory($after: String) {
      posts(first: 22, after: $after, where: { orderby: { field: DATE, order: DESC }, categoryName: "technology" }) {
        edges {
          node {
            title
            excerpt
            slug
            date
            postId
            featuredImage {
              node {
                sourceUrl
              }
            }
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
            ppmaAuthorName
            categories {
              edges {
                node {
                  name
                }
              }
            }
            seo {
              metaDesc
              title
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
    {
      variables: {
        preview,
        after,
      },
    }
  );

  return {
    edges: data?.posts?.edges || [],
    pageInfo: data?.posts?.pageInfo || { hasNextPage: false, endCursor: null }
  };
}


export async function getAllPostsForCommunity(preview = false, after = null) {
  try {
    const data = await fetchAPI(
      `
      query CommunityPosts($after: String) {
        posts(
          first: 22,
          after: $after, 
          where: { 
            orderby: { field: DATE, order: DESC },
            categoryName: "community" 
          }
        ) {
          edges {
            node {
              title
              excerpt
              slug
              date
              postId
              featuredImage {
                node {
                  sourceUrl
                }
              }
              author {
                node {
                  name
                  firstName
                  lastName
                  avatar {
                    url
                  }
                }
              }
              ppmaAuthorName
              categories {
                edges {
                  node {
                    name
                  }
                }
              }
              seo {
                metaDesc
                title
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
      {
        variables: {
          preview,
          after,
        },
      }
    );

    return {
      edges: data?.posts?.edges || [],
      pageInfo: data?.posts?.pageInfo || { hasNextPage: false, endCursor: null }
    };
  } catch (error) {
    console.error('Error in getAllPostsForCommunity:', error);
    return {
      edges: [],
      pageInfo: { hasNextPage: false, endCursor: null }
    };
  }
}

export async function getAllAuthors() {
  let allAuthors = [];
  let hasNextPage = true;
  let endCursor = null;

  while (hasNextPage) {
    const data = await fetchAPI(
      `
      query getAllAuthors($after: String) {
        posts(first: 50, after: $after) {
          edges {
            node {
              ppmaAuthorName
              ppmaAuthorImage
              author {
                node {
                  name
                  firstName
                  lastName
                  avatar {
                    url
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
      {
        variables: { after: endCursor },
      }
    );

    const edges = data?.posts?.edges;
    allAuthors = [...allAuthors, ...edges];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage;
    endCursor = data?.posts?.pageInfo?.endCursor;
  }
  return { edges: allAuthors };
}

export async function getPostsByAuthor() {
  let allPosts = [];
  let hasNextPage = true;
  let endCursor = null;

  while (hasNextPage) {
    const data = await fetchAPI(
      `
      query getPostsByAuthor($after: String) {
        posts(first: 50, after: $after) {
          edges {
            node {
              postId
              title
              ppmaAuthorName
              slug
              featuredImage {
                node {
                  sourceUrl
                }
              }
              categories {
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
      {
        variables: { after: endCursor },
      }
    );

    const edges = data?.posts?.edges;
    allPosts = [...allPosts, ...edges];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage;
    endCursor = data?.posts?.pageInfo?.endCursor;
  }
  return { edges: allPosts };
}

/** Shared "more stories" results, keyed by tag set. See fetchNodes below. */
const moreStoriesMemo = createMemo<any[]>();

export async function getMoreStoriesForSlugs(tags, slug) {
  const tagFilter = tags?.edges?.length > 0;
  const variables = tagFilter ? { tags: tags.edges.map((edge) => edge.node.name) } : undefined;
  let stories = [];

  const queryWithTags = `
    query Posts($tags: [String!]) {
      posts(
        first: 7,
        where: { orderby: { field: DATE, order: DESC }, ${tagFilter ? "tagSlugIn: $tags" : ""} }
      ) {
        edges {
          node {
            title
            excerpt
            slug
            date
            featuredImage { node { sourceUrl } }
            author { node { name firstName lastName avatar { url } } }
            ppmaAuthorName
            categories { edges { node { name } } }
          }
        }
      }
    }
  `;

  const fallbackQuery = `
    query PostsWithoutTags {
      posts(first: 7, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            title
            excerpt
            slug
            date
            featuredImage { node { sourceUrl } }
            author { node { name firstName lastName avatar { url } } }
            ppmaAuthorName
            categories { edges { node { name } } }
          }
        }
      }
    }
  `;

  // Both queries depend only on the tag list — the current post is filtered out
  // afterwards, in JS. So the network result is shareable across every post with
  // the same tags, and the untagged fallback is shared by all posts outright.
  // Memoizing collapses ~1000 queries per build into a handful. Callers only
  // ever .filter()/.map() the result, so the cached arrays are never mutated.
  const fetchNodes = (cacheKey: string, query: string, vars?: any) =>
    moreStoriesMemo(cacheKey, () =>
      fetchAPI(query, { variables: vars }).then(
        (result) => result?.posts?.edges.map(({ node }) => node) || []
      )
    );

  // Fetch posts with tags if applicable
  if (tagFilter) {
    const tagKey = `tags:${[...variables.tags].sort().join("|")}`;
    stories = (await fetchNodes(tagKey, queryWithTags, variables)).filter(
      (story) => story.slug !== slug
    );
  }

  // If no posts are found, fetch without tag filter
  if (!stories.length) {
    stories = (await fetchNodes("recent", fallbackQuery)).filter(
      (story) => story.slug !== slug
    );
  }

  // Remove posts with the same slug
  return {
    techMoreStories: { edges: stories.map((node) => ({ node })) },
    communityMoreStories: { edges: stories.map((node) => ({ node })) },
  };
}

export async function getPostsByAuthorName(authorName: string) {
  const data = await fetchAPI(
    `query PostsByAuthorName($authorName: String!) {
      posts(where: { authorName: $authorName }) {
        edges {
          node {
            title
            excerpt
            slug
            date
            postId
            featuredImage {
              node {
                sourceUrl
              }
            }
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
            ppmaAuthorName
            categories {
              edges {
                node {
                  name
                }
              }
            }
            seo {
              metaDesc
              title
            }
          }
        }
      }
    }`,
    {
      variables: {
        authorName,
      },
    }
  );

  const edges = data?.posts?.edges || [];

  return { edges };
}


export async function getPostAndMorePosts(slug, preview, previewData) {
  const postPreview = preview && previewData?.post;
  // The slug may be the id of an unpublished post
  const isId = Number.isInteger(Number(slug));
  const isSamePost = isId
    ? Number(slug) === postPreview.id
    : slug === postPreview.slug;
  const isDraft = isSamePost && postPreview?.status === "draft";
  const isRevision = isSamePost && postPreview?.status === "publish";
  // NOTE on the fragment below: the raw WordPress `author { node { ... } }`
  // field is intentionally omitted from slug-page queries. PublishPress
  // Multiple Authors (ppmaAuthorName) is the authoritative display author;
  // the native WP author is the system account that published the post and
  // caused an author mismatch in __NEXT_DATA__ vs the rendered schema
  // (reported 2026-04-14). AuthorMapping.tsx still needs raw author data —
  // it uses a separate getAllAuthors query that preserves the field.
  //
  // This note lives in a JS comment, NOT inside the GraphQL template literal:
  // the E2E mock server substring-matches on the query text, and an inline
  // `#` comment that mentions "getAllAuthors" was routing PostBySlug requests
  // to the mock's allAuthorsResponse branch at build time.
  const data = await fetchAPI(
    `
    fragment PostFields on Post {
      title
      excerpt
      slug
      date
      modified
      ppmaAuthorName
      ppmaAuthorImage
      featuredImage {
        node {
          sourceUrl
        }
      }
      categories {
        edges {
          node {
            name
          }
        }
      }
      tags {
        edges {
          node {
            name
          }
        }
      }
      seo{
        metaDesc
        title
      }
    }

    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...PostFields
        content
        ${
          // Only some of the fields of a revision are considered as there are some inconsistencies
          isRevision
            ? `
        revisions(first: 1, where: { orderby: { field: MODIFIED, order: DESC } }) {
          edges {
            node {
              title
              excerpt
              content
              modified
              ppmaAuthorName
              ppmaAuthorImage
            }
          }
        }
        `
            : ""
        }
      }
      posts(first: 3, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...PostFields
            
          }
        }
      }
    }
  `,
    {
      variables: {
        id: isDraft ? postPreview.id : slug,
        idType: isDraft ? "DATABASE_ID" : "SLUG",
      },
    }
  );

  // Draft posts may not have an slug
  if (isDraft) data.post.slug = postPreview.id;
  // Apply a revision (changes in a published post)
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node;

    if (revision) Object.assign(data.post, normalizePostNode(revision));
    delete data.post.revisions;
  }

  // Filter out the main post
  data.posts.edges = data.posts.edges.filter(({ node }) => node.slug !== slug);
  // If there are still 3 posts, remove the last one
  if (data.posts.edges.length > 2) data.posts.edges.pop();

  return data;
}

// function for fetching more posts for community or technology category
export async function fetchMorePosts(
  category: 'community' | 'technology',
  after: string | null = null,
  first: number = 22
) {

  const data = await fetchAPI(
    `
    query MorePosts($after: String, $first: Int!, $category: String!) {
      posts(
        first: $first,
        after: $after,
        where: {
          orderby: { field: DATE, order: DESC },
          categoryName: $category
        }
      ) {
        edges {
          node {
            title
            excerpt
            slug
            date
            postId
            featuredImage {
              node {
                sourceUrl
              }
            }
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
            ppmaAuthorName
            categories {
              edges {
                node {
                  name
                }
              }
            }
            seo {
              metaDesc
              title
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
    {
      variables: {
        after,
        first,
        category
      },
    }
  );

  return {
    edges: data?.posts?.edges || [],
    pageInfo: data?.posts?.pageInfo || { hasNextPage: false, endCursor: null }
  };
}

// --- ADDED THIS FUNCTION FOR SEARCH ---
export async function getAllPostsForSearch(preview = false) {
  // This query fetches ALL posts (up to 100) without a category filter
  // It only fetches fields needed for the MoreStories card
  const data = await fetchAPI(
    `
    query AllPostsForSearch {
      posts(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            title
            excerpt
            slug
            date
            postId
            featuredImage {
              node {
                sourceUrl
              }
            }
            author {
              node {
                name
                firstName
                lastName
                avatar {
                  url
                }
              }
            }
            ppmaAuthorName
            categories {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
    `,
    {
      variables: {
        preview,
      },
    }
  );

  return data?.posts?.edges || [];
}