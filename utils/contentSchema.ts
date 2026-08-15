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

/**
 * Extract FAQ Q&A pairs: a heading (h2–h4) whose text ends in "?", followed by
 * the prose up to the next heading. Only returns a set when at least 2 real
 * pairs are found, so ordinary posts don't get a spurious FAQPage.
 */
export function extractFaqs(
  html: string | undefined | null,
  max = 10,
): { question: string; answer: string }[] {
  if (!html) return [];
  const faqs: { question: string; answer: string }[] = [];
  const re = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>([\s\S]*?)(?=<h[2-4][^>]*>|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && faqs.length < max) {
    const question = stripTags(m[1]);
    if (!question.endsWith("?")) continue;
    const answer = stripTags(m[2]);
    if (question.length > 8 && answer.length > 20) {
      faqs.push({ question, answer: answer.slice(0, 900) });
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
