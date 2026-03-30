import { MetadataRoute } from 'next'

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://wp.keploy.io/graphql'

interface WPPostNode {
  slug: string
  modified: string
  categories?: {
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

    if (!res.ok) {
      console.error("fetchGraphQL res not ok:", res.status, res.statusText)
      return null
    }
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

async function fetchAllTaxonomies(type: 'tags' | 'categories' | 'users'): Promise<{ slug: string; lastModified: Date }[]> {
  const allNodes: { slug: string; lastModified: Date }[] = []
  let hasNextPage = true
  let after = ''

  while (hasNextPage) {
    const query = `
      query All${type}($after: String) {
        ${type}(first: 100, after: $after) {
          edges { 
            node { 
              slug
              posts(first: 1) {
                nodes {
                  modified
                }
              }
            } 
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    `
    const data = await fetchGraphQL<any>(query, { after: after || null })
    if (!data?.[type]) {
      console.log(`DEBUG: fetchGraphQL returned missing data for ${type}`)
      break
    }

    console.log(`DEBUG: Fetched ${type} page with ${data[type].edges.length} items. hasNextPage: ${data[type].pageInfo.hasNextPage}, endCursor: ${data[type].pageInfo.endCursor}`)
    
    // Failsafe to prevent excessive polling
    if (allNodes.length > 5000) {
      console.log(`DEBUG: Failsafe triggered for ${type}`)
      break
    }

    for (const edge of data[type].edges) {
      const node = edge.node
      const postMod = node.posts?.nodes?.[0]?.modified
      // Only include taxonomies that actually have published posts
      if (postMod) {
        allNodes.push({ slug: node.slug, lastModified: new Date(postMod) })
      }
    }
    hasNextPage = data[type].pageInfo.hasNextPage
    after = data[type].pageInfo.endCursor
  }
  return allNodes
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://keploy.io/blog'

  // Sequential fetching to deeply respect WP Engine GraphQL burst limits
  const posts = await fetchAllPosts()
  const tags = await fetchAllTaxonomies('tags')
  const categories = await fetchAllTaxonomies('categories')
  const authors = await fetchAllTaxonomies('users')

  // Get global latest from posts for the root `/blog`
  let globalLatestModified = new Date(0)
  posts.forEach(post => {
    const postDate = new Date(post.modified)
    if (postDate > globalLatestModified) {
      globalLatestModified = postDate
    }
  })
  if (globalLatestModified.getTime() === 0) {
    globalLatestModified = new Date()
  }

  // Static root blog entry using global max post modification date
  const sitemapData: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: globalLatestModified,
      changeFrequency: 'daily',
      priority: 1.0,
    }
  ]

  // Process Tags
  tags.forEach(tag => {
    sitemapData.push({
      url: `${baseUrl}/tag/${encodeURIComponent(tag.slug)}`,
      lastModified: tag.lastModified,
      changeFrequency: 'weekly',
      priority: 0.64,
    })
  })

  // Process Categories
  categories.forEach(cat => {
    sitemapData.push({
      url: `${baseUrl}/${encodeURIComponent(cat.slug)}`,
      lastModified: cat.lastModified,
      changeFrequency: 'weekly',
      priority: 0.80,
    })
  })

  // Process Authors (verified exact path: /blog/authors/[slug])
  authors.forEach(author => {
    sitemapData.push({
      url: `${baseUrl}/authors/${encodeURIComponent(author.slug)}`,
      lastModified: author.lastModified,
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
