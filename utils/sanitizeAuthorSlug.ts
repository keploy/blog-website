/**
 * Sanitizes author and tag slugs for URL routing.
 */
export function sanitizeAuthorSlug(name: string): string {
  if (!name) return '';
  return encodeURIComponent(
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
  );
}

export function sanitizeTagSlug(tag: string): string {
  if (!tag) return '';
  return encodeURIComponent(
    tag
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
  );
}
