/**
 * Sanitizes an author name to create a URL-safe slug.
 * Converts to lowercase, replaces whitespace with dashes,
 * and strips non-alphanumeric characters.
 * @param authorName - The author name to sanitize
 * @returns A sanitized slug (lowercase, URL-safe)
 */
import { sanitizeStringForURL } from "./sanitizeStringForUrl";

export function sanitizeAuthorSlug(authorName: string): string {
  if (!authorName) return "";
  return sanitizeStringForURL(authorName, true);
}

