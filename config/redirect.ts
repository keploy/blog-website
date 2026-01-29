
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
    return slugRedirects[slug] || null;
}

/**
 * Check if a slug has a redirect configured
 * @param slug - The slug to check
 * @returns true if the slug should be redirected
 */
export function hasRedirect(slug: string): boolean {
    return slug in slugRedirects;
}
