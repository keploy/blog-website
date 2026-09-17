const API_URL = process.env.WORDPRESS_API_URL

export interface FetchAPIOptions {
  variables?: Record<string, any>
}

async function fetchAPI(query = '', { variables }: FetchAPIOptions = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
  }

  if (!API_URL) {
    console.warn('WORDPRESS_API_URL is not defined in environment variables.')
    return {}
  }

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

export async function getPreviewPost(id: string | number, idType = 'DATABASE_ID') {
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

export async function getAllPostsWithSlug() {
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
  return data?.posts ?? { edges: [] }
}

export async function getAllPostsForHome(preview = false) {
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

  return data?.posts ?? { edges: [] }
}

export async function getAllPostsForTechnology(preview = false) {
  const data = await fetchAPI(
    `
    query AllPostsForCategory {
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
  )

  return data?.posts ?? { edges: [] }
}

export async function getPostAndMorePosts(slug?: string | string[], preview = false, previewData?: any) {
  const postPreview = preview && previewData?.post
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
        id: isDraft ? postPreview?.id : slug,
        idType: isDraft ? 'DATABASE_ID' : 'SLUG',
      },
    }
  )

  if (!data) {
    return { post: null, posts: { edges: [] } }
  }

  if (isDraft && data.post) data.post.slug = postPreview.id
  if (isRevision && data.post?.revisions) {
    const revision = data.post.revisions.edges[0]?.node
    if (revision) Object.assign(data.post, revision)
    delete data.post.revisions
  }

  if (data.posts?.edges) {
    data.posts.edges = data.posts.edges.filter(({ node }: any) => node.slug !== slug)
    if (data.posts.edges.length > 2) data.posts.edges.pop()
  }

  return data
}
