/**
 * Strip HTML tags and decode common WordPress HTML entities from a title string.
 * Used for meta descriptions and JSON-LD where raw HTML/entities hurt SEO quality.
 */
export function sanitizeTitle(rawTitle: string | undefined | null): string {
  return (rawTitle || 'Loading...')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014');
}

/**
 * Generate a safe meta description for a blog post.
 * Uses Yoast metaDesc if available and long enough, otherwise generates from title.
 */
export function getSafeDescription(
  isFallback: boolean,
  metaDesc: string | undefined | null,
  safeTitle: string
): string {
  if (isFallback) {
    return 'Keploy engineering blog — practical guides, tutorials, and best practices for developers and QA engineers.';
  }
  if (metaDesc && metaDesc.length >= 60) {
    return metaDesc;
  }
  return `Learn about ${safeTitle} — practical guide with examples and best practices from the Keploy engineering blog.`;
}
