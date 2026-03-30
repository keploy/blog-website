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

async function fetchGraphQL<T>(query: string, variables: Record<string, any> = {}): Promise<T | null> {
  try {
    const res = await fetch(WP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 86400 }, // 24-hour cache
    })

    if (!res.ok) return null
    const json = await res.json()
    return json.data as T
  } catch (error) {
    console.error('WPGraphQL fetch error:', error)
    return null
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
    const data = await fetchGraphQL<any>(query, { after: after || null })
    if (!data?.posts) break

    allPosts.push(...data.posts.edges.map((edge: any) => edge.node))
    hasNextPage = data.posts.pageInfo.hasNextPage
    after = data.posts.pageInfo.endCursor
  }
  return allPosts
}

async function fetchAllSlugs(type: 'tags' | 'categories' | 'users'): Promise<string[]> {
  const allSlugs: string[] = []
  let hasNextPage = true
  let after = ''

  while (hasNextPage) {
    const query = `
      query All${type}($after: String) {
        ${type}(first: 100, after: $after) {
          edges { node { slug } }
          pageInfo { hasNextPage endCursor }
        }
      }
    `
    const data = await fetchGraphQL<any>(query, { after: after || null })
    if (!data?.[type]) break

    allSlugs.push(...data[type].edges.map((edge: any) => edge.node.slug))
    hasNextPage = data[type].pageInfo.hasNextPage
    after = data[type].pageInfo.endCursor
  }
  return allSlugs
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://keploy.io/blog'

  // Static root blog entry
  const sitemapData: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    }
  ]

  // Dynamic Entries
  const [posts, tags, categories, authors] = await Promise.all([
    fetchAllPosts(),
    fetchAllSlugs('tags'),
    fetchAllSlugs('categories'),
    fetchAllSlugs('users')
  ])

  // Process Tags
  tags.forEach(slug => {
    sitemapData.push({
      url: `${baseUrl}/tag/${encodeURIComponent(slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.64,
    })
  })

  // Process Categories
  categories.forEach(slug => {
    sitemapData.push({
      url: `${baseUrl}/${encodeURIComponent(slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.80, // Giving categories high priority similar to old static URLs
    })
  })

  // Process Authors
  authors.forEach(slug => {
    sitemapData.push({
      url: `${baseUrl}/authors/${encodeURIComponent(slug)}`, // authors logic in WP
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.64,
    })
  })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Track unique URLs to ensure no duplicates
  const addedUrls = new Set<string>()
  sitemapData.forEach(item => addedUrls.add(item.url))

  // Process Posts
  posts.forEach((post) => {
    const primaryCategory = post.categories?.nodes[0]?.slug || 'uncategorized'
    const url = `${baseUrl}/${encodeURIComponent(primaryCategory)}/${encodeURIComponent(post.slug)}`

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
