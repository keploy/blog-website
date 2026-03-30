import { MetadataRoute } from 'next'

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://wp.keploy.io/graphql'

interface WPPostNode {
  slug: string
  modified: string
  categories: {
    nodes: {
      slug: string
    }[]
  }
}

interface WPGraphQLEdge {
  node: WPPostNode
}

interface WPGraphQLResponse {
  data: {
    posts: {
      edges: WPGraphQLEdge[]
      pageInfo: {
        hasNextPage: boolean
        endCursor: string
      }
    }
  }
}

async function fetchAllPosts(): Promise<WPPostNode[]> {
  const allPosts: WPPostNode[] = []
  let hasNextPage = true
  let after = ''

  while (hasNextPage) {
    const query = `
      query AllPosts($after: String) {
        posts(first: 100, after: $after) {
          edges {
            node {
              slug
              modified
              categories {
                nodes {
                  slug
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
    `

    const res = await fetch(WP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { after: after || null },
      }),
      next: { revalidate: 86400 }, // 24-hour cache
    })

    if (!res.ok) {
      console.error('Failed to fetch posts for sitemap')
      break
    }

    const json = (await res.json()) as WPGraphQLResponse
    const postsData = json.data?.posts

    if (!postsData) {
      break
    }

    allPosts.push(...postsData.edges.map(edge => edge.node))

    hasNextPage = postsData.pageInfo.hasNextPage
    after = postsData.pageInfo.endCursor
  }

  return allPosts
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://keploy.io/blog'
  
  // Static Entries
  const sitemapData: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/technology`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  // Dynamic Entries
  const posts = await fetchAllPosts()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // To ensure uniqueness per URL, though slug + primary category is usually unique 
  // we can use a Set to track added URLs
  const addedUrls = new Set<string>()

  posts.forEach((post) => {
    // Get primary category (first one)
    const primaryCategory = post.categories?.nodes[0]?.slug || 'uncategorized'
    
    // Some posts might be tagged in multiple categories but we only generate one URL per post
    // based on the first category as per requirements "no duplicate URLs if a post is tagged in multiple 
    // categories (pick the first one)"
    const url = `${baseUrl}/${primaryCategory}/${post.slug}`

    if (addedUrls.has(url)) return
    addedUrls.add(url)

    const postModifiedDate = new Date(post.modified)
    const priority = postModifiedDate >= thirtyDaysAgo ? 0.8 : 0.5

    sitemapData.push({
      url,
      lastModified: postModifiedDate,
      changeFrequency: 'daily',
      priority,
    })
  })

  return sitemapData
}
