export const maxDuration = 300; // This can run Vercel Functions for a maximum of 300 seconds
export const dynamic = 'force-dynamic';

const API_URL = process.env.WORDPRESS_API_URL;

// In-memory cache 
const cache = new Map();

async function fetchAPI(query = "", { variables }: Record<string, any> = {}) {
  const headers = { "Content-Type": "application/json" };

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`;
  }

  // Generate a unique cache key
  const cacheKey = JSON.stringify({ query, variables });
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const res = await fetch(API_URL, {
    headers,
    method: "POST",
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error("Failed to fetch API");
  }

  // Cache for 5 minutes (300,000 ms)
  cache.set(cacheKey, json.data);
  setTimeout(() => cache.delete(cacheKey), 300000);

  return json.data;
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
    { variables: { id, idType } }
  );
  return data.post;
}

export async function getAllTags() {
  let hasNextPage = true;
  let endCursor = null;
  let allTags = [];
  const maxTags = 500; // Reasonable limit to prevent over-fetching

  while (hasNextPage && allTags.length < maxTags) {
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
          first: 50, 
          after: endCursor,
        },
      }
    );

    const tags = data?.tags?.edges.map((edge) => edge.node) || [];
    allTags = allTags.concat(tags);
    hasNextPage = data?.tags?.pageInfo?.hasNextPage && allTags.length < maxTags;
    endCursor = data?.tags?.pageInfo?.endCursor;
  }
  return allTags;
}

export async function getAllPostsFromTags(tagName: String, preview) {
  const data = await fetchAPI(
    `
    query AllPosts($tagName: String!) {
      posts(first: 20, where: { orderby: { field: DATE, order: DESC }, tag: $tagName }) {
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
      variables: { tagName, onlyEnabled: !preview, preview },
    }
  );
  return data?.posts || { edges: [] };
}

export async function getAllPosts() {
  let allEdges = [];
  let hasNextPage = true;
  let endCursor = null;
  const maxPosts = 100;

  while (hasNextPage && allEdges.length < maxPosts) {
    const data = await fetchAPI(
      `
      query AllPosts($after: String) {
        posts(first: 20, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
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
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
      { variables: { after: endCursor } }
    );

    const edges = data?.posts?.edges || [];
    allEdges = [...allEdges, ...edges];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage && allEdges.length < maxPosts;
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
    { variables: { postId } }
  );
  return data.postBy.content;
}

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
    { variables: { authorName } }
  );
  return data?.users || { edges: [] };
}

export async function getAllPostsForTechnology(preview) {
  let allEdges = [];
  let hasNextPage = true;
  let endCursor = null;
  const maxPosts = 50; 

  while (hasNextPage && allEdges.length < maxPosts) {
    const data = await fetchAPI(
      `
      query AllPostsForCategory($after: String) {
        posts(first: 10, after: $after, where: { orderby: { field: DATE, order: DESC }, categoryName: "technology" }) {
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
      { variables: { preview, after: endCursor } }
    );

    const edges = data?.posts?.edges || [];
    allEdges = [...allEdges, ...edges];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage && allEdges.length < maxPosts;
    endCursor = data?.posts?.pageInfo?.endCursor;
  }
  return { edges: allEdges };
}

export async function getAllPostsForCommunity(preview) {
  let allEdges = [];
  let hasNextPage = true;
  let endCursor = null;
  const maxPosts = 50; 

  while (hasNextPage && allEdges.length < maxPosts) {
    const data = await fetchAPI(
      `
      query AllPostsForCategory($after: String) {
        posts(first: 10, after: $after, where: { orderby: { field: DATE, order: DESC }, categoryName: "community" }) {
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
      { variables: { preview, after: endCursor } }
    );

    const edges = data?.posts?.edges || [];
    allEdges = [...allEdges, ...edges];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage && allEdges.length < maxPosts;
    endCursor = data?.posts?.pageInfo?.endCursor;
  }
  return { edges: allEdges };
}

export async function getAllAuthors() {
  let allAuthors = [];
  let hasNextPage = true;
  let endCursor = null;
  const maxAuthors = 100;

  while (hasNextPage && allAuthors.length < maxAuthors) {
    const data = await fetchAPI(
      `
      query getAllAuthors($after: String) {
        posts(first: 20, after: $after) {
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
      { variables: { after: endCursor } }
    );

    const edges = data?.posts?.edges || [];
    allAuthors = [...allAuthors, ...edges];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage && allAuthors.length < maxAuthors;
    endCursor = data?.posts?.pageInfo?.endCursor;
  }
  return { edges: allAuthors };
}

export async function getPostsByAuthor() {
  let allPosts = [];
  let hasNextPage = true;
  let endCursor = null;
  const maxPosts = 100; 

  while (hasNextPage && allPosts.length < maxPosts) {
    const data = await fetchAPI(
      `
      query getPostsByAuthor($after: String) {
        posts(first: 20, after: $after) {
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
      { variables: { after: endCursor } }
    );

    const edges = data?.posts?.edges || [];
    allPosts = [...allPosts, ...edges];
    hasNextPage = data?.posts?.pageInfo?.hasNextPage && allPosts.length < maxPosts;
    endCursor = data?.posts?.pageInfo?.endCursor;
  }
  return { edges: allPosts };
}

export async function getMoreStoriesForSlugs(tags, slug) {
  const tagFilter = tags?.edges?.length > 0;
  const variables = tagFilter ? { tags: tags.edges.map((edge) => edge.node.name) } : undefined;
  let stories = [];
  let data;

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

  if (tagFilter) {
    data = await fetchAPI(queryWithTags, { variables });
    stories = data?.posts?.edges.map(({ node }) => node) || [];
    stories = stories.filter((story) => story.slug !== slug);
  }

  if (!stories.length) {
    data = await fetchAPI(fallbackQuery);
    stories = data?.posts?.edges.map(({ node }) => node) || [];
    stories = stories.filter((story) => story.slug !== slug);
  }

  return {
    techMoreStories: { edges: stories.map((node) => ({ node })) },
    communityMoreStories: { edges: stories.map((node) => ({ node })) },
  };
}

export async function getPostsByAuthorName(authorName) {
  const data = await fetchAPI(
    `query MyQuery3 {
      posts(first: 20, where: { authorName: "${authorName}" }) {
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
    }`
  );
  return { edges: data?.posts?.edges || [] };
}

export async function getPostAndMorePosts(slug, preview, previewData) {
  const postPreview = preview && previewData?.post;
  const isId = Number.isInteger(Number(slug));
  const isSamePost = isId ? Number(slug) === postPreview?.id : slug === postPreview?.slug;
  const isDraft = isSamePost && postPreview?.status === "draft";
  const isRevision = isSamePost && postPreview?.status === "publish";

  const data = await fetchAPI(
    `
    fragment AuthorFields on User {
      name
      firstName
      lastName
      avatar {
        url
      }
    }
    fragment PostFields on Post {
      title
      excerpt
      slug
      date
      ppmaAuthorName
      featuredImage {
        node {
          sourceUrl
        }
      }
      author {
        node {
          ...AuthorFields
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
      seo {
        metaDesc
        title
      }
    }
    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...PostFields
        content
        ${
          isRevision
            ? `
        revisions(first: 1, where: { orderby: { field: MODIFIED, order: DESC } }) {
          edges {
            node {
              title
              excerpt
              content
              author {
                node {
                  ...AuthorFields
                }
              }
              ppmaAuthorName
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

  if (isDraft) data.post.slug = postPreview.id;
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node;
    if (revision) Object.assign(data.post, revision);
    delete data.post.revisions;
  }

  data.posts.edges = data.posts.edges.filter(({ node }) => node.slug !== slug);
  if (data.posts.edges.length > 2) data.posts.edges.pop();

  return data;
}