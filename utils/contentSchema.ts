/**
 * Server-safe extractors that turn raw WordPress post HTML into structured-data
 * inputs. Regex-only (NO `document`) so they run in getStaticProps / SSR, unlike
 * the client-only extractAuthorData. Conservative by design — they return empty
 * when confidence is low so we never emit misleading schema.
 */

const LANG_ALIASES: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TypeScript",
  py: "Python",
  python: "Python",
  go: "Go",
  golang: "Go",
  rs: "Rust",
  rust: "Rust",
  java: "Java",
  rb: "Ruby",
  ruby: "Ruby",
  php: "PHP",
  c: "C",
  cpp: "C++",
  "c++": "C++",
  cs: "C#",
  "c#": "C#",
  csharp: "C#",
  sql: "SQL",
  bash: "Shell",
  sh: "Shell",
  shell: "Shell",
  zsh: "Shell",
  yaml: "YAML",
  yml: "YAML",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  dockerfile: "Dockerfile",
};

/** Distinct human-readable programming languages present in a post's code blocks. */
export function detectCodeLanguages(html: string | undefined | null): string[] {
  if (!html) return [];
  const found = new Set<string>();
  const re = /language-([a-z0-9+#]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const norm = LANG_ALIASES[m[1].toLowerCase()];
    if (norm) found.add(norm);
  }
  return Array.from(found);
}

// String.fromCodePoint throws RangeError on out-of-range values, so a malformed
// entity like &#9999999999; in untrusted WP content would crash the build.
// Guard the range and drop anything invalid rather than throw.
function safeFromCodePoint(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 0x10ffff) return "";
  try {
    return String.fromCodePoint(n);
  } catch {
    return "";
  }
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    // Decode numeric/hex entities (WP emits &#8217; &#8220; &#8211; etc.) so
    // smart quotes/dashes don't leak into FAQ/Answer text as raw entities.
    .replace(/&#(\d+);/g, (_, n) => safeFromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => safeFromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Deliberately DO NOT decode &lt; / &gt;: leaving angle brackets encoded is
    // the same defence-in-depth layer utils/seo.ts's decodeEntities documents,
    // behind safeJsonLdStringify. Decoding them here would silently remove that
    // layer for any text that flows into JSON-LD. See PR review #3.
    // &amp; last so we never double-decode (e.g. "&amp;#8217;" stays literal).
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// A post opts into FAQPage by adding a heading whose text is exactly "FAQ",
// "FAQs", "FAQ's", or "Frequently Asked Questions" (trailing ":" / whitespace
// ignored). Only Q&A *under that heading* are extracted.
const FAQ_SECTION_HEADING = /^(faqs?|faq's|frequently asked questions)$/i;

/**
 * Extract FAQ Q&A pairs — but ONLY from an explicit FAQ section, not from every
 * "?" heading in the post. An earlier version scraped any heading ending in "?"
 * and swept everything up to the next heading into the answer, so code blocks
 * and tables got flattened and clipped into mangled "answers" an AI would cite
 * (PR review #2). Now:
 *   1. find the marker heading (FAQ / Frequently Asked Questions),
 *   2. bound the section at the next heading of the same-or-higher level,
 *   3. inside it, each sub-heading ending in "?" is a question and the answer is
 *      the text of the following <p> paragraphs only (code/tables/lists skipped).
 * Still requires ≥2 clean pairs, so a stray "FAQ" heading alone emits nothing.
 */
export function extractFaqs(
  html: string | undefined | null,
  max = 10,
): { question: string; answer: string }[] {
  if (!html) return [];

  // 1. Locate the FAQ marker heading and its level.
  const headingRe = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let marker: RegExpExecArray | null;
  let sectionStart = -1;
  let markerLevel = 0;
  while ((marker = headingRe.exec(html)) !== null) {
    const text = stripTags(marker[2]).replace(/[:\s]+$/, "").trim();
    if (FAQ_SECTION_HEADING.test(text)) {
      markerLevel = Number(marker[1]);
      sectionStart = headingRe.lastIndex;
      break;
    }
  }
  if (sectionStart === -1) return [];

  // 2. The section ends at the next heading of level <= the marker that is NOT
  // itself a question — so "FAQ (h2) → questions at h2" still works (a same-
  // level "?" heading stays a question; a same-level "Conclusion" closes it).
  let sectionEnd = html.length;
  const boundaryRe = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  boundaryRe.lastIndex = sectionStart;
  let boundary: RegExpExecArray | null;
  while ((boundary = boundaryRe.exec(html)) !== null) {
    if (
      Number(boundary[1]) <= markerLevel &&
      !stripTags(boundary[2]).endsWith("?")
    ) {
      sectionEnd = boundary.index;
      break;
    }
  }
  const section = html.slice(sectionStart, sectionEnd);

  // 3. Question sub-headings ending in "?", answer = following <p> text only.
  const faqs: { question: string; answer: string }[] = [];
  const qRe = /<h([2-6])[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[2-6][^>]*>|$)/gi;
  let q: RegExpExecArray | null;
  while ((q = qRe.exec(section)) !== null && faqs.length < max) {
    const question = stripTags(q[2]);
    if (!question.endsWith("?")) continue;
    const paragraphs: string[] = [];
    // `<p(?:\s[^>]*)?>` matches <p> / <p class="…"> but NOT <pre> — otherwise a
    // code block leaks into the answer (the exact flattening review #2 flagged).
    const pRe = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi;
    let p: RegExpExecArray | null;
    while ((p = pRe.exec(q[3])) !== null) {
      const t = stripTags(p[1]);
      if (t) paragraphs.push(t);
    }
    const answer = paragraphs.join(" ").slice(0, 900);
    if (question.length > 8 && answer.length > 20) {
      faqs.push({ question, answer });
    }
  }
  return faqs.length >= 2 ? faqs : [];
}

/**
 * Approximate word count of a post's rendered text (HTML tags + entities
 * stripped first so markup tokens don't inflate the count). Feeds the
 * schema.org `wordCount` on Article nodes.
 */
export function countWords(html: string | undefined | null): number {
  if (!html) return 0;
  const text = stripTags(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
