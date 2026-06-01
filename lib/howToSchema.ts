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

import { decodeEntities } from "../utils/seo";

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
  return raw.toLowerCase().trim().replace(/\s+/g, "-");
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

// Reuse the shared sanitizer that powers meta titles/descriptions so the
// HowTo schema and the rest of the metadata pipeline can't drift on entity
// handling. utils/seo.ts also carries the script-context safety note about
// why `&lt;` / `&gt;` are intentionally NOT decoded into raw angle brackets
// — important context for any future change to that list.
const stripHtml = decodeEntities;

// Step text can come from any of these tags after a heading — not just <p>.
// Authors frequently put a <ul>/<ol> immediately after a step heading
// (instruction lists), or a <blockquote> / <pre> for callouts and code.
// Without this fallback set, a tutorial with 4 headings whose bodies use
// any of those instead of <p> would yield 0 usable steps and emit no
// schema even though it IS a tutorial. Order matters: <p> first because it
// is by far the most common body element, then list/code/blockquote.
const STEP_BODY_TAGS = ["p", "ul", "ol", "blockquote", "pre"] as const;

// Decode a matched body element into plain step text. For list bodies the
// raw inner HTML is "<li>A</li><li>B</li>" — feeding that straight to
// `stripHtml` drops the tags with no separator and concatenates the items
// into a run-on token ("AB"). Split on the list-item boundaries first and
// join with ". " so each item stays a distinct clause in the JSON-LD.
function decodeStepBody(tag: string, inner: string): string {
  if (tag === "ul" || tag === "ol") {
    return inner
      .split(/<\/li\s*>/i)
      .map((item) => stripHtml(item))
      .filter(Boolean)
      .join(". ");
  }
  return stripHtml(inner);
}

// Truncate at the last whitespace boundary at-or-before `limit` so a step
// never ends mid-word. Falls back to a hard slice only if no whitespace
// exists in the window (extremely rare — would mean a single ~110-char
// unbroken token, e.g. a URL).
function truncateAtBoundary(value: string, limit: number): string {
  if (value.length <= limit) return value;
  const window = value.slice(0, limit);
  const boundary = window.lastIndexOf(" ");
  const cut = boundary > 0 ? boundary : limit - 3;
  return `${value.slice(0, cut).trimEnd()}...`;
}

/**
 * Walks the HTML body and pairs each h2/h3 with the first usable body
 * element (see STEP_BODY_TAGS) that follows it, up to the next heading.
 * Caps step text length so the JSON-LD stays compact.
 */
function extractStepsFromContent(html: string): AuthoredHowToStep[] {
  if (!html) return [];
  const steps: AuthoredHowToStep[] = [];
  // Find every h2/h3, in order, with their text and source index.
  const headingRegex = /<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  const headings: {
    start: number;
    end: number;
    level: number;
    name: string;
  }[] = [];
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
    // Try each body tag in priority order; first one that yields decoded
    // text wins. Pick the EARLIEST occurrence within the slice across all
    // tags so a <ul> appearing before a later <p> is still preferred.
    let text = "";
    let earliestIdx = Infinity;
    for (const tag of STEP_BODY_TAGS) {
      const re = new RegExp(
        `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
        "i",
      );
      const match = slice.match(re);
      if (!match || match.index === undefined) continue;
      if (match.index >= earliestIdx) continue;
      const decoded = decodeStepBody(tag, match[1]);
      if (!decoded) continue;
      earliestIdx = match.index;
      text = decoded;
    }
    // Skip steps with no usable body — they aren't useful in JSON-LD.
    if (!text) continue;
    // Intentionally NOT setting `step.url`: the rendered post doesn't carry
    // server-side anchor ids on its h2/h3s — `components/post-body.tsx`
    // attaches them in a client useEffect — so any `#slug` we emit here
    // would point at a non-existent anchor in the SSR HTML that crawlers see.
    steps.push({
      name: truncateAtBoundary(h.name, 110),
      text: truncateAtBoundary(text, 480),
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
    // Google's HowTo rich-result docs use a full ImageObject (with url and,
    // when known, width/height) rather than a bare URL string. We only know
    // the source URL at this layer — WPGraphQL's `featuredImage` doesn't
    // surface intrinsic dimensions here — so emit just `@type` + `url`. A
    // future enrichment can add height/width by querying `mediaDetails`.
    schema.image = [
      {
        "@type": "ImageObject",
        url: post.featuredImage.node.sourceUrl,
      },
    ];
  }
  if (post.date) schema.datePublished = post.date;

  return schema;
}
