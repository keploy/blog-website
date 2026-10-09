/**
 * Where the 404 page should send a visitor once its countdown finishes.
 *
 * A missing post under a known section (`/community/does-not-exist`) goes back
 * to that section's index, and everything else goes to the blog home. The path
 * is router-relative (no `basePath`), as returned by `router.asPath`, so it can
 * be passed straight to `router.replace`.
 */
const SECTION_ROOTS = ["/community", "/technology"] as const;

export function getNotFoundRedirectTarget(asPath: string): string {
  // Drop the query string and hash so `/community/x?utm=1` still matches.
  const path = (asPath || "/").split(/[?#]/)[0];

  for (const root of SECTION_ROOTS) {
    if (path === root || path.startsWith(`${root}/`)) {
      return root;
    }
  }
  return "/";
}
