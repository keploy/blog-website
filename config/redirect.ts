
/**
 * Slug redirect mappings
 * Maps old/deprecated slugs to their new destinations
 * 
 * Usage:
 * - Key: The old slug that should be redirected
 * - Value: The new slug to redirect to
 */

export const slugRedirects: Record<string, string> = {
    // Example redirects - add your mappings here
    // "old-post-slug": "new-post-slug",
    "everything-you-need-to-know-about-api-testing": "what-is-api-testing",
    "regression-testing-tools-rankings-2025": "regression-testing-tools"

    // "deprecated-article": "updated-article",
};

/**
 * Get the redirect destination for a given slug
 * @param slug - The slug to check for redirects
 * @returns The new slug if a redirect exists, otherwise null
 */
export function getRedirectSlug(slug: string): string | null {
    // Guard the prototype chain: a bare `slugRedirects[slug]` lookup returns
    // Object.prototype's method for a slug like "toString", and that function
    // is truthy — which would send a real post into a bogus redirect.
    if (!hasRedirect(slug)) return null;
    return slugRedirects[slug] || null;
}

/**
 * Check if a slug has a redirect configured
 * @param slug - The slug to check
 * @returns true if the slug should be redirected
 */
export function hasRedirect(slug: string): boolean {
    // hasOwnProperty, not `in`: `in` walks the prototype chain, so a post
    // legitimately slugged "constructor" or "toString" would report as having
    // a redirect and get silently dropped from getStaticPaths.
    return Object.prototype.hasOwnProperty.call(slugRedirects, slug);
}
