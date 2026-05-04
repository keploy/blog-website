/**
 * HowTo JSON-LD builder for tutorial blog posts.
 *
 * A WordPress post is treated as a tutorial when it carries a tag whose
 * name normalizes to one of `HOWTO_TAG_NORMALIZED`. Tags ride on the
 * existing GraphQL fragment (`tags.edges.node.name`), so this works without
 * any WordPress-side schema changes. Slugs are not queried — name is the
 * only signal we have here.
 *
 * Steps are extracted from the rendered post HTML — h2/h3 headings paired
 * with the first <p> that follows. If that yields < 2 usable steps, the
 * helper returns null so the page does not emit an invalid schema.
 *
 * The helper is purely string-based (does not touch the DOM, does not import
 * cheerio) so it is safe for both server-side and client-side rendering.
 */

type RawTagEdge = {
  node?: {
    name?: string;
  };
};

type AuthoredHowToStep = {
  name?: string;
  text?: string;
  image?: string;
};

export type TutorialPostShape = {
  title?: string;
  slug?: string;
  content?: string;
  date?: string;
  // The blog uses WPGraphQL, so tags are nested as edges.
  tags?: {
    edges?: RawTagEdge[];
  };
  seo?: {
    metaDesc?: string;
  };
  featuredImage?: {
    node?: {
      sourceUrl?: string;
    };
  };
};

// Normalized form used for tag matching. Keeping this kebab-cased+lowercased
// means a WordPress tag named "How To" (display name with whitespace + caps)
// matches the same bucket as "howto" / "how-to" / "tutorial".
const HOWTO_TAG_NORMALIZED = new Set(["howto", "how-to", "tutorial"]);

function normalizeTagName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function isTutorial(post: TutorialPostShape): boolean {
  const edges = post?.tags?.edges ?? [];
  for (const e of edges) {
    const name = e?.node?.name;
    if (!name) continue;
    if (HOWTO_TAG_NORMALIZED.has(normalizeTagName(name))) return true;
  }
  return false;
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Walks the HTML body and pairs each h2/h3 with the first <p> that follows it,
 * up to the next heading. Caps step text length so the JSON-LD stays compact.
 */
function extractStepsFromContent(html: string): AuthoredHowToStep[] {
  if (!html) return [];
  const steps: AuthoredHowToStep[] = [];
  // Find every h2/h3, in order, with their text and source index.
  const headingRegex = /<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  const headings: {start: number; end: number; level: number; name: string}[] = [];
  let m: RegExpExecArray | null;
  while ((m = headingRegex.exec(html)) !== null) {
    const name = stripHtml(m[2]);
    if (!name) continue;
    headings.push({
      start: m.index,
      end: m.index + m[0].length,
      level: Number(m[1]),
      name,
    });
  }
  for (let i = 0; i < headings.length; i += 1) {
    const h = headings[i];
    const next = headings[i + 1];
    const slice = html.slice(h.end, next ? next.start : html.length);
    const pMatch = slice.match(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i);
    const text = pMatch ? stripHtml(pMatch[1]) : "";
    // Skip steps with no usable body — they aren't useful in JSON-LD.
    if (!text) continue;
    // Intentionally NOT setting `step.url`: the rendered post doesn't carry
    // server-side anchor ids on its h2/h3s — `components/post-body.tsx`
    // attaches them in a client useEffect — so any `#slug` we emit here
    // would point at a non-existent anchor in the SSR HTML that crawlers see.
    steps.push({
      name: h.name.length > 110 ? `${h.name.slice(0, 107)}...` : h.name,
      text: text.length > 480 ? `${text.slice(0, 477)}...` : text,
    });
  }
  return steps;
}

export type HowToJsonLd = Record<string, unknown>;

/**
 * Returns a HowTo JSON-LD object suitable for injecting via <script type="application/ld+json">,
 * or null if the post is not a tutorial / doesn't yield a valid step array.
 *
 * `safeTitle` and `safeDescription` MUST already be passed through
 * `sanitizeTitle` / `getSafeDescription` (or equivalent) by the caller —
 * matching the existing BlogPosting schema on these pages so JSON-LD
 * doesn't ship raw Yoast HTML/entities.
 */
export function getHowToSchema(
  post: TutorialPostShape | null | undefined,
  pageUrl: string,
  safeTitle: string,
  safeDescription: string,
): HowToJsonLd | null {
  if (!post || !safeTitle) return null;
  if (!isTutorial(post)) return null;

  const steps: AuthoredHowToStep[] = post.content
    ? extractStepsFromContent(post.content)
    : [];

  // Google requires at least 2 steps for HowTo to render rich-result-style.
  if (steps.length < 2) return null;

  const schema: HowToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: safeTitle,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    step: steps.map((s, i) => {
      const step: Record<string, unknown> = {
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      };
      if (s.image) step.image = s.image;
      return step;
    }),
  };

  if (safeDescription) schema.description = safeDescription;
  if (post.featuredImage?.node?.sourceUrl) {
    schema.image = [post.featuredImage.node.sourceUrl];
  }
  if (post.date) schema.datePublished = post.date;

  return schema;
}
