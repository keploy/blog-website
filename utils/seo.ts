/**
 * Strip HTML tags, decode common WordPress HTML entities, and normalize whitespace.
 * Used for meta descriptions and JSON-LD where raw HTML/entities hurt SEO quality.
 *
 * Exported so JSON-LD builders (e.g. lib/howToSchema.ts) can reuse the same
 * decode list \u2014 keeping a second copy in those files lets entity handling
 * drift the next time WordPress surfaces a new typographic entity.
 *
 * Note: this function intentionally does NOT decode `&lt;` / `&gt;` to raw
 * angle brackets. The output is consumed inside <script> tags (meta tags,
 * JSON-LD payloads), where a literal `</script>` inside a string body would
 * terminate the script element and break the page. JSON.stringify does not
 * escape `<` or `>`, so once we let raw `<` into the value, downstream
 * `dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}` callers
 * have no defence. We strip tags via the regex above instead \u2014 angle
 * brackets that were entity-encoded in the source were never structural
 * markup, so leaving them as `&lt;` text in the script payload is safer
 * than decoding them.
 */
export function decodeEntities(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
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
