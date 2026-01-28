import {
  AUTHOR_FIELDS_FRAGMENT,
  POST_PREVIEW_FRAGMENT,
  FULL_POST_FRAGMENT,
  PAGINATION_INFO_FRAGMENT,
  FEATURED_IMAGE_FRAGMENT,
  CATEGORY_FIELDS_FRAGMENT,
} from './graphql-fragments';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const API_URL = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL

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
          first: 100,
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
    ${POST_PREVIEW_FRAGMENT}
    
    query AllPosts($tagName: String!) {
      posts(first: 100, where: { orderby: { field: DATE, order: DESC }, tag: $tagName }) {
        edges {
          node {
            ...PostPreviewFields
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
      ${POST_PREVIEW_FRAGMENT}
      ${PAGINATION_INFO_FRAGMENT}
      
      query AllPosts($after: String) {
        posts(first: 50, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
          edges {
            node {
              ...PostPreviewFields
            }
          }
          pageInfo {
            ...PaginationInfo
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
    ${AUTHOR_FIELDS_FRAGMENT}
    
    query AuthorDetailsByName($authorName: String!) {
      users(where: { search: $authorName }) {
        edges {
          node {
            ...AuthorFields
            email
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



// Function for fetching post with technology category
export async function getAllPostsForTechnology(preview = false, after = null) {
  const data = await fetchAPI(
    `
    ${POST_PREVIEW_FRAGMENT}
    ${PAGINATION_INFO_FRAGMENT}
    
    query AllPostsForCategory($after: String) {
      posts(first: 22, after: $after, where: { orderby: { field: DATE, order: DESC }, categoryName: "technology" }) {
        edges {
          node {
            ...PostPreviewFields
          }
        }
        pageInfo {
          ...PaginationInfo
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
      ${POST_PREVIEW_FRAGMENT}
      ${PAGINATION_INFO_FRAGMENT}
      
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
              ...PostPreviewFields
            }
          }
          pageInfo {
            ...PaginationInfo
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
      ${AUTHOR_FIELDS_FRAGMENT}
      ${PAGINATION_INFO_FRAGMENT}
      
      query getAllAuthors($after: String) {
        posts(first: 50, after: $after) {
          edges {
            node {
              ppmaAuthorName
              ppmaAuthorImage
              author {
                node {
                  ...AuthorFields
                }
              }
            }
          }
          pageInfo {
            ...PaginationInfo
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
      ${FEATURED_IMAGE_FRAGMENT}
      ${CATEGORY_FIELDS_FRAGMENT}
      ${PAGINATION_INFO_FRAGMENT}
      
      query getPostsByAuthor($after: String) {
        posts(first: 50, after: $after) {
          edges {
            node {
              postId
              title
              ppmaAuthorName
              slug
              ...FeaturedImageFields
              ...CategoryFields
            }
          }
          pageInfo {
            ...PaginationInfo
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

export async function getMoreStoriesForSlugs(tags, slug) {
  const tagFilter = tags?.edges?.length > 0;
  const variables = tagFilter ? { tags: tags.edges.map((edge) => edge.node.name) } : undefined;
  let stories = [];
  let data;

  const queryWithTags = `
    ${POST_PREVIEW_FRAGMENT}
    
    query Posts($tags: [String!]) {
      posts(
        first: 7,
        where: { orderby: { field: DATE, order: DESC }, ${tagFilter ? "tagSlugIn: $tags" : ""} }
      ) {
        edges {
          node {
            ...PostPreviewFields
          }
        }
      }
    }
  `;

  const fallbackQuery = `
    ${POST_PREVIEW_FRAGMENT}
    
    query PostsWithoutTags {
      posts(first: 7, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...PostPreviewFields
          }
        }
      }
    }
  `;

  // Fetch posts with tags if applicable
  if (tagFilter) {
    data = await fetchAPI(queryWithTags, { variables });
    stories = data?.posts?.edges.map(({ node }) => node) || [];
    stories = stories.filter((story) => story.slug !== slug);
  }

  // If no posts are found, fetch without tag filter
  if (!stories.length) {
    data = await fetchAPI(fallbackQuery);
    stories = data?.posts?.edges.map(({ node }) => node) || [];
    stories = stories.filter((story) => story.slug !== slug);

  }

  // Remove posts with the same slug
  return {
    techMoreStories: { edges: stories.map((node) => ({ node })) },
    communityMoreStories: { edges: stories.map((node) => ({ node })) },
  };
}

export async function getPostsByAuthorName(authorName: string) {
  const data = await fetchAPI(
    `
    ${POST_PREVIEW_FRAGMENT}
    
    query PostsByAuthorName($authorName: String!) {
      posts(where: { authorName: $authorName }) {
        edges {
          node {
            ...PostPreviewFields
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
  const data = await fetchAPI(
    `
    ${FULL_POST_FRAGMENT}
    ${AUTHOR_FIELDS_FRAGMENT}

    query PostBySlug($id: ID!, $idType: PostIdType!) {
      post(id: $id, idType: $idType) {
        ...FullPostFields
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
            ...FullPostFields
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

    if (revision) Object.assign(data.post, revision);
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
    ${POST_PREVIEW_FRAGMENT}
    ${PAGINATION_INFO_FRAGMENT}
    
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
            ...PostPreviewFields
          }
        }
        pageInfo {
          ...PaginationInfo
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
    ${POST_PREVIEW_FRAGMENT}
    
    query AllPostsForSearch {
      posts(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            ...PostPreviewFields
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