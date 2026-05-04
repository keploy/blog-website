/**
 * HowTo JSON-LD builder for tutorial blog posts.
 *
 * A WordPress post is treated as a tutorial when EITHER:
 *   1. it has a tag named "howto" (case-insensitive), OR
 *   2. it carries a custom meta field `is_tutorial` set to true, OR
 *   3. an explicit `howto_steps` field is present in the post payload.
 *
 * The `step` array is sourced (in priority order) from:
 *   1. an explicit `howto_steps` array on the post (preferred — authored), or
 *   2. h2/h3 headings + their first paragraph extracted from `post.content`.
 *
 * If neither source yields >= 2 steps, the helper returns null so the page
 * does NOT emit an invalid schema.
 *
 * The helper is purely string-based (does not touch the DOM, does not import
 * cheerio) so it is safe for both server-side and client-side rendering.
 */

type RawTagEdge = {
  node?: {
    name?: string;
    slug?: string;
  };
};

type AuthoredHowToStep = {
  name?: string;
  text?: string;
  url?: string;
  image?: string;
};

export type TutorialPostShape = {
  title?: string;
  slug?: string;
  content?: string;
  date?: string;
  // Optional explicit steps the author can ship from WordPress as a
  // post-meta JSON array.
  howto_steps?: AuthoredHowToStep[] | null;
  // Optional flag the author can set in WordPress as a custom field.
  is_tutorial?: boolean;
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

const HOWTO_TAG_NAMES = ["howto", "how-to", "tutorial"];

function isTutorial(post: TutorialPostShape): boolean {
  if (post?.is_tutorial === true) return true;
  if (Array.isArray(post?.howto_steps) && post.howto_steps.length > 0) {
    return true;
  }
  const tagNames =
    post?.tags?.edges
      ?.map((e) => (e?.node?.name || e?.node?.slug || "").toLowerCase())
      .filter(Boolean) ?? [];
  return tagNames.some((n) => HOWTO_TAG_NAMES.includes(n));
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
    const slug = h.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    steps.push({
      name: h.name.length > 110 ? `${h.name.slice(0, 107)}...` : h.name,
      text: text.length > 480 ? `${text.slice(0, 477)}...` : text,
      url: slug ? `#${slug}` : undefined,
    });
  }
  return steps;
}

export type HowToJsonLd = Record<string, unknown>;

/**
 * Returns a HowTo JSON-LD object suitable for injecting via <script type="application/ld+json">,
 * or null if the post is not a tutorial / doesn't yield a valid step array.
 */
export function getHowToSchema(
  post: TutorialPostShape | null | undefined,
  pageUrl: string,
): HowToJsonLd | null {
  if (!post || !post.title) return null;
  if (!isTutorial(post)) return null;

  let steps: AuthoredHowToStep[] = [];
  if (Array.isArray(post.howto_steps) && post.howto_steps.length > 0) {
    steps = post.howto_steps
      .map((s) => ({
        name: (s?.name || "").trim(),
        text: (s?.text || "").trim(),
        url: s?.url,
        image: s?.image,
      }))
      .filter((s) => s.name && s.text);
  } else if (post.content) {
    steps = extractStepsFromContent(post.content);
  }

  // Google requires at least 2 steps for HowTo to render rich-result-style.
  if (steps.length < 2) return null;

  const schema: HowToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.title,
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
      if (s.url) {
        step.url = s.url.startsWith("#") ? `${pageUrl}${s.url}` : s.url;
      }
      if (s.image) step.image = s.image;
      return step;
    }),
  };

  if (post.seo?.metaDesc) schema.description = post.seo.metaDesc;
  if (post.featuredImage?.node?.sourceUrl) {
    schema.image = [post.featuredImage.node.sourceUrl];
  }
  if (post.date) schema.datePublished = post.date;

  return schema;
}
