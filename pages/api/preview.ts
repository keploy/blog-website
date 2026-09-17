import type { NextApiRequest, NextApiResponse } from 'next'
import { getPreviewPost } from '../../lib/api'

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const secret = Array.isArray(req.query.secret) ? req.query.secret[0] : req.query.secret
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug

  // Check the secret and next parameters
  // This secret should only be known by this API route
  if (
    !process.env.WORDPRESS_PREVIEW_SECRET ||
    secret !== process.env.WORDPRESS_PREVIEW_SECRET ||
    (!id && !slug)
  ) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  try {
    // Fetch WordPress to check if the provided `id` or `slug` exists
    const post = await getPreviewPost(id || slug, id ? 'DATABASE_ID' : 'SLUG')

    // If the post doesn't exist prevent preview mode from being enabled
    if (!post) {
      return res.status(401).json({ message: 'Post not found' })
    }

    // Enable Preview Mode by setting the cookies
    res.setPreviewData({
      post: {
        id: post.databaseId,
        slug: post.slug,
        status: post.status,
      },
    })

    // Redirect to the path from the fetched post
    // We don't redirect to `req.query.slug` as that might lead to open redirect vulnerabilities
    res.writeHead(307, { Location: `/posts/${post.slug || post.databaseId}` })
    res.end()
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch preview post' })
  }
}

