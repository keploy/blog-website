/**
 * WordPress-entity decoders — two variants depending on output context.
 *
 * Both share the same numeric/typographic decode list so callers cannot drift
 * the next time WordPress surfaces a new entity. Where they diverge is on
 * `&lt;` / `&gt;`:
 *
 * `decodeEntities` (script-safe — leaves `&lt;` / `&gt;` as entities) is
 * used by JSON-LD builders (e.g. `lib/howToSchema.ts`). Those payloads
 * ultimately ship inside
 * `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: ...}} />`.
 * The hard XSS guarantee against `</script>` termination lives in
 * `safeJsonLdStringify` below — every injection site goes through it — so
 * this decoder leaving entity brackets alone is now a *defence-in-depth*
 * layer rather than the sole protection: even if a future caller forgets
 * the script-safe stringify, the schema fields still don't carry raw `<` /
 * `>` from this decoder's output.
 *
 * `decodeEntitiesForAttribute` (full decode — converts `&lt;` / `&gt;` to
 * `<` / `>`) is used by `sanitizeTitle` / `getSafeDescription`. Those values
 * land in JSX attribute/text positions (`<meta content={safeDescription}>`,
 * `<title>{safeTitle}</title>`) where React HTML-encodes `<` / `>` for us
 * on render. Leaving them as `&lt;` here would cause React to encode the
 * leading `&` and ship `&amp;lt;` in the final HTML source — wrong in SERP
 * snippets and social previews. Restoring the decode on this path matches
 * the pre-#383 behaviour from `3c89e73`.
 *
 * The leading `replace(/<[^>]*>/g, '')` in both strips structural tag
 * wrappers, so the only `<` / `>` that ever reach either output are ones the
 * WordPress author entity-encoded on purpose (e.g. inline code like
 * `&lt;keploy record&gt;`).
 */
const SHARED_DECODES: ReadonlyArray<[RegExp, string]> = [
  [/&amp;/g, "&"],
  [/&quot;/g, '"'],
  [/&#8217;/g, "'"],
  [/&#8216;/g, "'"],
  [/&#8220;/g, "“"],
  [/&#8221;/g, "”"],
  [/&#8211;/g, "–"],
  [/&#8212;/g, "—"],
  [/&#39;/g, "'"],
  [/&nbsp;/g, " "],
];

function applyDecodes(
  text: string,
  extra: ReadonlyArray<[RegExp, string]> = [],
): string {
  let out = text.replace(/<[^>]*>/g, "");
  for (const [re, sub] of SHARED_DECODES) out = out.replace(re, sub);
  for (const [re, sub] of extra) out = out.replace(re, sub);
  return out.replace(/\s+/g, " ").trim();
}

/** Script-safe decoder. Use for JSON-LD payloads. Leaves `&lt;`/`&gt;` as entities. */
export function decodeEntities(text: string): string {
  return applyDecodes(text);
}

/**
 * Attribute/text-context decoder. Use for `<meta>` / `<title>` values fed
 * through JSX, where React re-escapes `<`/`>` for safe output. Decodes the
 * full WP entity set including `&lt;`/`&gt;`.
 */
export function decodeEntitiesForAttribute(text: string): string {
  return applyDecodes(text, [
    [/&lt;/g, "<"],
    [/&gt;/g, ">"],
  ]);
}

/**
 * Defensively serialize a value for injection inside
 * `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: ...}} />`.
 *
 * `JSON.stringify` does not escape `<`, `>`, `&`, or the JS-only line
 * separators U+2028 / U+2029, so a field value containing `</script>` would
 * close the surrounding script element. Now that `sanitizeTitle` /
 * `getSafeDescription` legitimately decode `&lt;`/`&gt;` for the
 * `<meta>` / `<title>` attribute path, those same strings can flow into
 * JSON-LD on the post pages — so the safety guarantee has to live at the
 * script boundary instead of relying on every upstream sanitizer to keep
 * angle brackets encoded.
 *
 * The five replacements below produce JSON that is still valid (the escapes
 * decode back to the original characters in JS) but cannot terminate the
 * enclosing `<script>` tag, start an HTML comment, or trip JSONP / inline
 * JS parsers on U+2028/U+2029.
 *
 * Edge case: `JSON.stringify` returns `undefined` (not a string) for
 * `undefined`, function values, and bare symbols. Coerce that to the JSON
 * literal `"null"` so the helper still returns a valid JSON payload (an
 * empty schema slot is preferable to an SSR crash from `.replace` on
 * `undefined`). Calling sites can also choose not to render the
 * `<script>` tag when the value is missing.
 */
export function safeJsonLdStringify(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (typeof serialized !== "string") return "null";
  return serialized
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function sanitizeTitle(rawTitle: string | undefined | null): string {
  if (!rawTitle) return "";
  return decodeEntitiesForAttribute(rawTitle);
}

/**
 * Generate a safe meta description for a blog post.
 * Uses Yoast metaDesc if available and long enough, otherwise generates from title.
 */
export function getSafeDescription(
  isFallback: boolean,
  metaDesc: string | undefined | null,
  safeTitle: string,
): string {
  if (isFallback) {
    return "Keploy engineering blog — practical guides, tutorials, and best practices for developers and QA engineers.";
  }
  if (metaDesc) {
    const clean = decodeEntitiesForAttribute(metaDesc);
    if (clean.length >= 60) {
      return clean;
    }
  }
  if (!safeTitle) {
    return "Keploy engineering blog — practical guides, tutorials, and best practices for developers and QA engineers.";
  }
  return `Learn about ${safeTitle} — practical guide with examples and best practices from the Keploy engineering blog.`;
}
