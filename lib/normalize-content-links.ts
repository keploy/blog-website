import { blogRedirects } from "../config/blog-redirects";
import { slugRedirects } from "../config/redirect";
import vercelConfig from "../vercel.json";

// WordPress post bodies carry hand-typed internal links that 404 or hop
// through a redirect (trailing slashes, doubled slashes, scheme-less
// "keploy.io/..." hrefs, ChatGPT utm tags, renamed slugs). Search Console
// flags every one of them, and they can only be fixed post by post in WP, so
// they are rewritten to the final URL at render time. Only keploy.io links are
// touched, and only /blog paths have their path rewritten.

const BLOG_PREFIX = "/blog";
const KEPLOY_HOSTS = new Set(["keploy.io", "www.keploy.io"]);
const MAX_REDIRECT_HOPS = 5;

// Exact-path redirects keyed by full /blog path. First writer wins, matching
// the order they apply in production: vercel.json, next.config, then the
// per-slug redirects resolved inside getStaticProps.
const renamedPaths: Map<string, string> = (() => {
  const map = new Map<string, string>();
  const add = (from: string, to: string) => {
    if (/[:(*]/.test(from) || !to.startsWith(`${BLOG_PREFIX}/`)) return;
    if (!map.has(from)) map.set(from, to);
  };
  for (const r of vercelConfig.redirects ?? []) {
    if (r.source.startsWith(`${BLOG_PREFIX}/`)) add(r.source, r.destination);
  }
  for (const r of blogRedirects) {
    add(`${BLOG_PREFIX}${r.source}`, `${BLOG_PREFIX}${r.destination}`);
  }
  for (const [from, to] of Object.entries(slugRedirects)) {
    for (const category of ["community", "technology"]) {
      add(`${BLOG_PREFIX}/${category}/${from}`, `${BLOG_PREFIX}/${category}/${to}`);
    }
  }
  return map;
})();

function resolveRenamedPath(path: string): string {
  let current = path;
  for (let i = 0; i < MAX_REDIRECT_HOPS; i++) {
    const next = renamedPaths.get(current);
    if (!next || next === current) break;
    current = next;
  }
  return current;
}

export function normalizeKeployHref(href: string): string {
  const hadEncodedAmp = /&(?:amp|#0*38);/.test(href);
  let candidate = (hadEncodedAmp ? href.replace(/&(?:amp|#0*38);/g, "&") : href).trim();

  // href="keploy.io/slack" resolves relative to the post URL and 404s.
  const schemeless = /^(www\.)?keploy\.io(?=$|[/?#])/i.test(candidate);
  if (schemeless) candidate = `https://${candidate}`;
  if (!/^https?:\/\//i.test(candidate)) return href;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return href;
  }
  if (!KEPLOY_HOSTS.has(url.hostname)) return href;

  const before = url.toString();
  url.protocol = "https:";
  url.hostname = "keploy.io";

  const path = url.pathname;
  if (path === BLOG_PREFIX || path.startsWith(`${BLOG_PREFIX}/`)) {
    const cleaned = path.replace(/\/{2,}/g, "/").replace(/[/:]+$/, "");
    url.pathname = resolveRenamedPath(cleaned || BLOG_PREFIX);
  }

  if (url.searchParams.get("utm_source") === "chatgpt.com") {
    url.searchParams.delete("utm_source");
  }

  const after = url.toString();
  if (after === before && !schemeless) return href;
  return hadEncodedAmp ? after.replace(/&/g, "&amp;") : after;
}

// Rewrites the href of every <a> tag in a post body. Same `[^>]*` tag match as
// the external-link pass in post-body.tsx; `\s` before href skips data-href.
export function normalizeContentLinks(html: string): string {
  if (!html) return html;
  return html.replace(/<a\b[^>]*>/gi, (tag) =>
    tag.replace(
      /(\shref\s*=\s*)(?:"([^"]*)"|'([^']*)')/i,
      (match, prefix: string, dq?: string, sq?: string) => {
        const value = dq ?? sq ?? "";
        const next = normalizeKeployHref(value);
        if (next === value) return match;
        const quote = dq !== undefined ? '"' : "'";
        return `${prefix}${quote}${next}${quote}`;
      }
    )
  );
}
