const API_URL = process.env.WORDPRESS_API_URL

export interface WPAuthor {
  name?: string
  firstName?: string
  lastName?: string
  avatar?: {
    url?: string
  }
}

export interface WPCategory {
  node: {
    name: string
  }
}

export interface WPTag {
  node: {
    name: string
  }
}

export interface WPFeaturedImage {
  node: {
    sourceUrl: string
  }
}

export interface WPPostNode {
  title?: string
  excerpt?: string
  slug?: string
  date?: string
  databaseId?: number | string
  status?: string
  content?: string
  featuredImage?: WPFeaturedImage
  author?: {
    node?: WPAuthor
  }
  categories?: {
    edges?: WPCategory[]
  }
  tags?: {
    edges?: WPTag[]
  }
}

export interface WPPostsConnection {
  edges: Array<{
    node: WPPostNode
  }>
}

export interface PreviewDataPost {
  id?: number | string
  slug?: string
  status?: string
}

async function fetchAPI(
  query = '',
  { variables }: { variables?: Record<string, any> } = {}
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers[
      'Authorization'
    ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
  }

  if (!API_URL) {
    throw new Error('WORDPRESS_API_URL environment variable is not defined')
  }

  // WPGraphQL Plugin must be enabled
  const res = await fetch(API_URL, {
    headers,
    method: 'POST',
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  const json = await res.json()
  if (json.errors) {
    console.error(json.errors)
    throw new Error('Failed to fetch API')
  }
  return json.data
}

export async function getPreviewPost(
  id: string | number | string[] | undefined,
  idType: 'DATABASE_ID' | 'SLUG' = 'DATABASE_ID'
): Promise<WPPostNode | undefined> {
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
  )
  return data?.post
}

export async function getAllPostsWithSlug(): Promise<WPPostsConnection | undefined> {
  const data = await fetchAPI(`
    {
      posts(first: 10000) {
        edges {
          node {
            slug
          }
        }
      }
    }
  `)
  return data?.posts
}

export async function getAllPostsForHome(
  preview?: boolean
): Promise<WPPostsConnection | undefined> {

  const data = await fetchAPI(
    `
    query AllPosts {
      posts(first: 100, where: { orderby: { field: DATE, order: DESC } categoryName: "community" }) {
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
        onlyEnabled: !preview,
        preview,
      },
    }
  )

  return data?.posts
}


// Function for fetching post with technology category
export async function getAllPostsForTechnology(
  preview?: boolean
): Promise<WPPostsConnection | undefined> {
  const data = await fetchAPI(
    `
    query AllPostsForCategory{
      posts(first: 20, where: { orderby: { field: DATE, order: DESC } categoryName: "technology" }) {
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
                firstName
                lastName
                avatar {
                  url
                }
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
      }
    }
  `,
    {
      variables: {
        preview,
      },
    }
  );

  return data?.posts
}

export async function getPostAndMorePosts(
  slug: string | number | string[] | undefined,
  preview?: boolean,
  previewData?: { post?: PreviewDataPost }
): Promise<{ post: WPPostNode; posts: WPPostsConnection }> {
  const postPreview = preview && previewData?.post
  // The slug may be the id of an unpublished post
  const isId = Number.isInteger(Number(slug))
  const isSamePost = isId
    ? Number(slug) === postPreview?.id
    : slug === postPreview?.slug
  const isDraft = isSamePost && postPreview?.status === 'draft'
  const isRevision = isSamePost && postPreview?.status === 'publish'
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
              author {
                node {
                  ...AuthorFields
                }
              }
            }
          }
        }
        `
            : ''
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
        idType: isDraft ? 'DATABASE_ID' : 'SLUG',
      },
    }
  )

  // Draft posts may not have an slug
  if (isDraft) data.post.slug = postPreview.id
  // Apply a revision (changes in a published post)
  if (isRevision && data.post.revisions) {
    const revision = data.post.revisions.edges[0]?.node

    if (revision) Object.assign(data.post, revision)
    delete data.post.revisions
  }

  // Filter out the main post
  data.posts.edges = data.posts.edges.filter(({ node }) => node.slug !== slug)
  // If there are still 3 posts, remove the last one
  if (data.posts.edges.length > 2) data.posts.edges.pop()

  return data
}
