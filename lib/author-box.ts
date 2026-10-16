// Server-safe PublishPress author-box parsing. utils/extractAuthorData relies on
// `document`, so it can't run in getStaticProps/SSR — these regexes pull the same
// fields out of the raw author-box HTML for the JSON-LD. One module so the three
// call sites (authors, technology, community pages) can't drift apart, which is
// exactly the drift that produced the bio-truncation bug the shared @id then
// surfaced as two conflicting Person.description values.

export type AuthorBoxMeta = {
  avatarUrl?: string;
  linkedIn?: string;
  bio?: string;
};

// The bio lives in <p class="pp-author-boxes-description">…</p>. Match through to
// the closing </p> — NOT the first closing tag of any kind — so a bio containing
// inline markup (e.g. an <a> link) is captured in full instead of being truncated
// at the first </a>. decodeEntities in the schema builders strips the surviving
// inline tags before the text reaches the JSON-LD.
const BIO_RE =
  /<p[^>]*class=["'][^"']*pp-author-boxes-description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i;
const AVATAR_RE =
  /pp-author-boxes-avatar[\s\S]{0,200}?<img[^>]+src=["']([^"']+)["']/i;
const LINKEDIN_RE = /href=["'](https?:\/\/[^"']*linkedin\.com[^"']*)["']/i;

/**
 * Extract just the author bio from raw author-box HTML. Returns undefined when
 * there is no author box or the bio is empty, so callers can pass the result
 * straight into the schema builders' "real bio only" guard.
 */
export function extractAuthorBio(html?: string): string | undefined {
  const bio = html?.match(BIO_RE)?.[1]?.trim();
  return bio && bio.length > 0 ? bio : undefined;
}

/**
 * Extract avatar URL, LinkedIn URL, and bio from raw author-box HTML in one pass.
 * Used by the author profile page to build the enriched Person node.
 */
export function extractAuthorBox(html?: string): AuthorBoxMeta {
  if (!html) return {};
  return {
    avatarUrl: html.match(AVATAR_RE)?.[1],
    linkedIn: html.match(LINKEDIN_RE)?.[1],
    bio: extractAuthorBio(html),
  };
}
