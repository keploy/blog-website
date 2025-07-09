import { Post } from "../types/post";
import {
  TagNode,
  PageInfo,
  PostEdge,
  PostsConnection,
  PreviewPost,
  ReviewAuthorResult,
  AuthorEdge,
  AuthorConnection,
  PostAndMorePostsResponse,
} from "../types/OtherApiTypes";



export const maxDuration = 300; // This can run Vercel Functions for a maximum of 300 seconds
export const dynamic = "force-dynamic";

const API_URL =
  process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL;



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
  return json.data;
}

export async function getPreviewPost(id: string | number, idType = "DATABASE_ID"): Promise<PreviewPost> {
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


export async function getAllTags(): Promise<TagNode[]> {
  let hasNextPage = true;
  let endCursor: string | null = null;
  const allTags: TagNode[] = [];

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
          first: 100,
          after: endCursor,
        },
      }
    );

    const tags = data?.tags?.edges.map((edge: { node: TagNode }) => edge.node);
    allTags.push(...tags);

    hasNextPage = data?.tags?.pageInfo?.hasNextPage;
    endCursor = data?.tags?.pageInfo?.endCursor;
  }

  return allTags;
}


export async function getAllPostsFromTags(
  tagName: string,
  preview: boolean
): Promise<PostsConnection | undefined> {
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

  return data?.posts as PostsConnection;
}


export async function getAllPosts(): Promise<{ edges: PostEdge[] }> {
  let allEdges: PostEdge[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;

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
      {
        variables: { after: endCursor },
      }
    );

    const edges: PostEdge[] = data?.posts?.edges || [];
    allEdges.push(...edges);
    hasNextPage = data?.posts?.pageInfo?.hasNextPage;
    endCursor = data?.posts?.pageInfo?.endCursor;
  }

  return { edges: allEdges };
}

export async function getContent(postId: number): Promise<string> {
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

  return data.postBy.content as string;
}


//Fetching Reviewing author details


export async function getReviewAuthorDetails(
  authorName: string
): Promise<ReviewAuthorResult | undefined> {
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

  return data?.users as ReviewAuthorResult;
}

// Function for fetching post with technology category
export async function getAllPostsForTechnology(
  preview: boolean = false,
  after: string | null = null
): Promise<PostsConnection> {
  const data = await fetchAPI(
    `
    query AllPostsForCategory($after: String) {
      posts(
        first: 22,
        after: $after,
        where: {
          orderby: { field: DATE, order: DESC },
          categoryName: "technology"
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
    edges: (data?.posts?.edges || []) as PostEdge[],
    pageInfo: (data?.posts?.pageInfo || {
      hasNextPage: false,
      endCursor: null,
    }) as PageInfo,
  };
}

export async function getAllPostsForCommunity(
  preview: boolean = false,
  after: string | null = null
): Promise<PostsConnection> {
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
      edges: (data?.posts?.edges || []) as PostEdge[],
      pageInfo: (data?.posts?.pageInfo || {
        hasNextPage: false,
        endCursor: null,
      }) as PageInfo,
    };
  } catch (error) {
    console.error("Error in getAllPostsForCommunity:", error);
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
    };
  }
}

export async function getAllAuthors(): Promise<AuthorConnection> {
  let allAuthors: AuthorEdge[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;

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

    const edges: AuthorEdge[] = data?.posts?.edges || [];
    allAuthors.push(...edges);
    hasNextPage = data?.posts?.pageInfo?.hasNextPage;
    endCursor = data?.posts?.pageInfo?.endCursor;
  }

  return { edges: allAuthors };
}

export async function getPostsByAuthor(): Promise<PostsConnection> {
  let allPosts: PostEdge[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;

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

    const edges: PostEdge[] = data?.posts?.edges || [];
    allPosts.push(...edges);
    hasNextPage = data?.posts?.pageInfo?.hasNextPage;
    endCursor = data?.posts?.pageInfo?.endCursor;
  }

  return { edges: allPosts };
}


export async function getMoreStoriesForSlugs(
  tags: { edges: { node: { name: string } }[] },
  slug: string
): Promise<{
  techMoreStories: PostsConnection;
  communityMoreStories: PostsConnection;
}> {
  const tagFilter = tags?.edges?.length > 0;
  const variables = tagFilter
    ? { tags: tags.edges.map((edge) => edge.node.name) }
    : undefined;

  let stories: Post[] = [];
  let data;

  const queryWithTags = `
    query Posts($tags: [String!]) {
      posts(
        first: 7,
        where: { orderby: { field: DATE, order: DESC }, ${
          tagFilter ? "tagSlugIn: $tags" : ""
        } }
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

  // Fetch posts with tags if applicable
  if (tagFilter) {
    data = await fetchAPI(queryWithTags, { variables });
    stories = data?.posts?.edges.map(({ node }: { node: Post }) => node) || [];
    stories = stories.filter((story) => story.slug !== slug);
  }

  // If no posts are found, fetch without tag filter
  if (!stories.length) {
    data = await fetchAPI(fallbackQuery);
    stories = data?.posts?.edges.map(({ node }: { node: Post }) => node) || [];
    stories = stories.filter((story) => story.slug !== slug);
  }

  return {
    techMoreStories: { edges: stories.map((node) => ({ node })) },
    communityMoreStories: { edges: stories.map((node) => ({ node })) },
  };
}


export async function getPostsByAuthorName(
  authorName: string
): Promise<PostsConnection> {
  const data = await fetchAPI(
    `query MyQuery3 {
      posts(where: {authorName: "${authorName}"}) {
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

  const edges: PostEdge[] = data.posts.edges || [];
  return { edges };
}

export async function getPostAndMorePosts(
  slug: string,
  preview: boolean,
  previewData: { post?: PreviewPost }
): Promise<PostAndMorePostsResponse> {
  const postPreview = preview && previewData?.post;

  const isId = Number.isInteger(Number(slug));
  const isSamePost = isId
    ? Number(slug) === postPreview?.id
    : slug === postPreview?.slug;

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

  data.posts.edges = data.posts.edges.filter(
    ({ node }: { node: Post }) => node.slug !== slug
  );

  if (data.posts.edges.length > 2) {
    data.posts.edges.pop();
  }

  return data as PostAndMorePostsResponse;
}

// function for fetching more posts for community or technology category
export async function fetchMorePosts(
  category: "community" | "technology",
  after: string | null = null,
  first: number = 22
): Promise<PostsConnection> {
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
        category,
      },
    }
  );

  return {
    edges: (data?.posts?.edges || []) as PostEdge[],
    pageInfo: (data?.posts?.pageInfo || {
      hasNextPage: false,
      endCursor: null,
    }) as PageInfo,
  };
}
