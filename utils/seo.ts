/**
 * Strip HTML tags, decode common WordPress HTML entities, and normalize whitespace.
 * Used for meta descriptions and JSON-LD where raw HTML/entities hurt SEO quality.
 */
function decodeEntities(text: string): string {
  return text
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
    .replace(/&#8212;/g, '\u2014')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeTitle(rawTitle: string | undefined | null): string {
  if (!rawTitle) return '';
  return decodeEntities(rawTitle);
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
  if (metaDesc) {
    const clean = decodeEntities(metaDesc);
    if (clean.length >= 60) {
      return clean;
    }
  }
  if (!safeTitle) {
    return 'Keploy engineering blog — practical guides, tutorials, and best practices for developers and QA engineers.';
  }
  return `Learn about ${safeTitle} — practical guide with examples and best practices from the Keploy engineering blog.`;
}
