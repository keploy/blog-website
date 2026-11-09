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

// PublishPress injects its own author box into post content. On keploy.io it
// renders empty (only an `#author-description-placeholder` div) and carries the
// plugin's hardcoded `box-post-id-16` on every post, so crawlers saw an empty,
// identical author block on all pages. The page renders its own per-post
// AuthorCard from ppmaAuthorName/ppmaAuthorImage + the WP user bio, so the
// plugin markup (and its scoped <style> block) is removed from the body.
// Call extractAuthorBio on the RAW content first if you need its bio.
// Match each complete begin/end block on its own (the body may not contain
// another "begin code"), then drop only blocks that are PublishPress boxes, so
// an earlier unrelated code block can never be swallowed.
const CODE_BLOCK_RE = /<!--\s*begin code\s*-->(?:(?!<!--\s*begin code\s*-->)[\s\S])*?<!--\s*end code\s*-->/gi;
const PP_BOX_STYLE_RE = /<style[^>]*>[^<]*pp-multiple-authors-boxes-wrapper[\s\S]*?<\/style>/gi;

export function stripPublishPressAuthorBox(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(CODE_BLOCK_RE, (block) => (block.includes("pp-multiple-authors") ? "" : block))
    .replace(PP_BOX_STYLE_RE, "");
}

type WpUserNode = { name?: string; avatar?: { url?: string }; description?: string };

/**
 * Pick the WP user whose display name matches the post's PublishPress author
 * exactly (case-insensitive). `users(where:{search})` is a fuzzy match, so a
 * loose first-hit would attach another person's bio to the post.
 */
export function pickWpUserForAuthor(
  users: { edges?: { node?: WpUserNode }[] } | null | undefined,
  authorName?: string | null,
): WpUserNode | null {
  const target = (authorName || "").trim().toLowerCase();
  if (!target) return null;
  return (
    users?.edges
      ?.map((e) => e?.node)
      .find((n) => (n?.name || "").trim().toLowerCase() === target) ?? null
  );
}

export type PublicAuthor = { name: string; avatar: { url: string } | null; description: string };

/** Whitelist public author fields only — never email or other private data. */
export function toPublicAuthor(node: WpUserNode | null | undefined): PublicAuthor | null {
  if (!node?.name) return null;
  return {
    name: node.name,
    avatar: node.avatar?.url ? { url: node.avatar.url } : null,
    description: node.description || "",
  };
}
