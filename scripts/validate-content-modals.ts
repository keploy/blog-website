/**
 * validate-content-modals.ts
 *
 * Checks every entry in config/content-modals.ts against the live WordPress copy
 * of its post: ids are unique, and each anchorText is found exactly where the
 * real injector would place it. A modal whose anchor is not found disappears from
 * the page with no error, and once the SEO team deletes the matching section in
 * WordPress that content is gone entirely, so this gates CI instead.
 *
 * USAGE:
 *   npm run validate:modals
 *   CONTENT_MODALS_WP_URL=https://wp.keploy.io npm run validate:modals
 *
 * Exit code is non-zero on a duplicate id, a post that can't be found, or an
 * anchor that does not match.
 */

import { contentModals } from "../config/content-modals";
import { injectModalTriggers } from "../lib/content-modals";

const WP_URL = (process.env.CONTENT_MODALS_WP_URL || "https://wp.keploy.io").replace(/\/$/, "");

async function fetchPostHtml(slug: string): Promise<string | null> {
  const res = await fetch(
    `${WP_URL}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=content`,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status} for slug "${slug}"`);
  const posts = (await res.json()) as { content?: { rendered?: string } }[];
  return posts[0]?.content?.rendered ?? null;
}

async function main() {
  const errors: string[] = [];

  const seen = new Set<string>();
  for (const m of contentModals) {
    if (seen.has(m.id)) errors.push(`duplicate id: ${m.id}`);
    seen.add(m.id);
  }

  const slugs = Array.from(new Set(contentModals.map((m) => m.blogSlug)));
  for (const slug of slugs) {
    const modals = contentModals.filter((m) => m.blogSlug === slug);
    const html = await fetchPostHtml(slug);
    if (html === null) {
      errors.push(`post not found in WordPress: ${slug} (${modals.map((m) => m.id).join(", ")})`);
      continue;
    }
    const injected = new Set<string>();
    const out = injectModalTriggers(html, modals, injected);
    for (const m of modals) {
      const count = out.split(`data-cm-id="${m.id}"`).length - 1;
      if (!injected.has(m.id) || count !== 1) {
        errors.push(`${slug}: anchor not found for "${m.id}" ("${m.anchorText}")`);
      } else {
        console.log(`ok  ${slug}: ${m.id}`);
      }
    }
  }

  if (errors.length) {
    for (const e of errors) console.error(`ERROR ${e}`);
    process.exit(1);
  }
  console.log(`\n${contentModals.length} content modal(s) valid.`);
}

main().catch((err) => {
  console.error(`ERROR ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
