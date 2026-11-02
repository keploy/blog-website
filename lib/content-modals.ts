import type { ContentModalConfig } from "../config/content-modals";

// Text inside these elements never becomes a trigger: nesting a button in a link,
// heading, code sample or another button breaks semantics or styling.
const SKIP_TAGS = new Set(["a", "button", "code", "pre", "script", "style", "h1", "h2", "h3", "h4", "h5", "h6"]);

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Wraps the first eligible occurrence of each modal's anchorText in a trigger button.
 * Only text between tags is matched, so attributes and URLs are never rewritten.
 * `injected` is shared across calls so a modal is wired once per post even when the
 * body is processed in chunks.
 */
export function injectModalTriggers(
  html: string,
  modals: ContentModalConfig[],
  injected: Set<string>,
): string {
  const pending = modals.filter((m) => !injected.has(m.id));
  if (!pending.length) return html;

  const tokens = html.split(/(<[^>]+>)/);
  const skipStack: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    if (token.startsWith("<")) {
      const tag = /^<\s*(\/)?\s*([a-z0-9]+)/i.exec(token);
      if (!tag) continue;
      const name = tag[2].toLowerCase();
      if (!SKIP_TAGS.has(name) || token.endsWith("/>")) continue;
      if (tag[1]) {
        const idx = skipStack.lastIndexOf(name);
        if (idx !== -1) skipStack.splice(idx);
      } else {
        skipStack.push(name);
      }
      continue;
    }

    if (skipStack.length) continue;

    // Consume the text left to right so a later anchor can never match inside
    // markup this loop has already emitted.
    let rest = token;
    let out = "";
    for (;;) {
      let best: { m: ContentModalConfig; index: number; length: number } | null = null;
      for (const m of pending) {
        if (injected.has(m.id)) continue;
        const hit = new RegExp(escapeRegex(m.anchorText), "i").exec(rest);
        if (hit && (!best || hit.index < best.index)) best = { m, index: hit.index, length: hit[0].length };
      }
      if (!best) break;
      injected.add(best.m.id);
      const id = escapeAttr(best.m.id);
      out +=
        rest.slice(0, best.index) +
        `<button type="button" class="keploy-cm-trigger" data-cm-id="${id}" aria-haspopup="dialog" aria-controls="cm-${id}">` +
        rest.slice(best.index, best.index + best.length) +
        `</button>`;
      rest = rest.slice(best.index + best.length);
    }
    tokens[i] = out + rest;
    if (pending.every((m) => injected.has(m.id))) break;
  }

  return tokens.join("");
}
