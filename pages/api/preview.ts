import type { NextApiRequest, NextApiResponse } from 'next'
import { getPreviewPost } from '../../lib/api'

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { secret, id, slug } = req.query

  const secretVal = Array.isArray(secret) ? secret[0] : secret
  const idVal = Array.isArray(id) ? id[0] : id
  const slugVal = Array.isArray(slug) ? slug[0] : slug

  // Check the secret and next parameters
  if (
    !process.env.WORDPRESS_PREVIEW_SECRET ||
    secretVal !== process.env.WORDPRESS_PREVIEW_SECRET ||
    (!idVal && !slugVal)
  ) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  // Fetch WordPress to check if the provided `id` or `slug` exists
  const targetIdentifier = idVal || slugVal
  if (!targetIdentifier) {
    return res.status(400).json({ message: 'Missing target identifier' })
  }

  const post = await getPreviewPost(targetIdentifier, idVal ? 'DATABASE_ID' : 'SLUG')

  // If the post doesn't exist prevent preview mode from being enabled
  if (!post) {
    return res.status(404).json({ message: 'Post not found' })
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
  res.writeHead(307, { Location: `/posts/${post.slug || post.databaseId}` })
  res.end()
}
