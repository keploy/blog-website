import type { ContentModalConfig } from "../config/content-modals";
import type { KeywordTooltipConfig } from "../config/keyword-tooltips";

// Text inside these elements never becomes a modal trigger: a button nested in a
// link, heading, code sample, form control or another button breaks semantics.
const MODAL_SKIP_TAGS = new Set([
  "a", "button", "code", "pre", "script", "style",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "label", "summary", "select", "textarea", "figcaption",
]);

// Tooltips are plain spans, so links and headings stay eligible (unchanged behaviour);
// they only avoid code, form controls and the modal trigger buttons.
const TOOLTIP_SKIP_TAGS = new Set(["button", "code", "pre", "script", "style", "select", "textarea"]);

// Comments first, then tags. Quote-aware, so `>` inside a quoted attribute value
// or a comment (e.g. Gutenberg block JSON) does not end the token.
const TOKEN_SPLIT = /(<!--[\s\S]*?-->|<(?:[^>"']|"[^"]*"|'[^']*')+>)/;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

interface Marker {
  id: string;
  text: string;
  /** Require the match to not touch a word character or hyphen on either side. */
  wholeWord: boolean;
  render: (match: string) => string;
}

/**
 * Wraps the first eligible occurrence of each marker's text using `render`.
 * Only text between tags is matched, so attributes, comments and URLs are never
 * rewritten. `injected` is shared across calls so each marker is used once per post
 * even when the body is processed in chunks.
 */
function injectMarkers(html: string, markers: Marker[], injected: Set<string>, skipTags: Set<string>): string {
  const pending = markers.filter((m) => !injected.has(m.id));
  if (!pending.length) return html;

  // Built once per call. Group 1 is the leading boundary char, so no lookbehind is
  // needed (lookbehind throws on older Safari, and this also runs on the client).
  const patterns = new Map(
    pending.map((m) => [
      m.id,
      m.wholeWord
        ? new RegExp(`(^|[^\\w-])(${escapeRegex(m.text)})(?![\\w-])`, "i")
        : new RegExp(`()(${escapeRegex(m.text)})`, "i"),
    ]),
  );

  const tokens = html.split(TOKEN_SPLIT);
  const skipStack: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    if (token.startsWith("<")) {
      const tag = /^<\s*(\/)?\s*([a-z0-9]+)/i.exec(token);
      if (!tag) continue;
      const name = tag[2].toLowerCase();
      if (!skipTags.has(name) || token.endsWith("/>")) continue;
      if (tag[1]) {
        const idx = skipStack.lastIndexOf(name);
        if (idx !== -1) skipStack.splice(idx);
      } else {
        skipStack.push(name);
      }
      continue;
    }

    if (skipStack.length) continue;

    // Consume the text left to right so a later marker can never match inside
    // markup this loop has already emitted.
    let rest = token;
    let out = "";
    for (;;) {
      let best: { m: Marker; start: number; match: string } | null = null;
      for (const m of pending) {
        if (injected.has(m.id)) continue;
        const hit = patterns.get(m.id)!.exec(rest);
        if (!hit) continue;
        const start = hit.index + hit[1].length;
        if (!best || start < best.start) best = { m, start, match: hit[2] };
      }
      if (!best) break;
      injected.add(best.m.id);
      out += rest.slice(0, best.start) + best.m.render(best.match);
      rest = rest.slice(best.start + best.match.length);
    }
    tokens[i] = out + rest;
    if (pending.every((m) => injected.has(m.id))) break;
  }

  return tokens.join("");
}

export function injectModalTriggers(html: string, modals: ContentModalConfig[], injected: Set<string>): string {
  return injectMarkers(
    html,
    modals.map((m) => {
      const id = escapeAttr(m.id);
      return {
        id: m.id,
        text: m.anchorText,
        wholeWord: true,
        render: (match: string) =>
          `<button type="button" class="keploy-cm-trigger" data-cm-id="${id}" aria-haspopup="dialog" aria-controls="cm-${id}">${match}</button>`,
      };
    }),
    injected,
    MODAL_SKIP_TAGS,
  );
}

export function injectTooltipSpans(html: string, tooltips: KeywordTooltipConfig[], injected: Set<string>): string {
  return injectMarkers(
    html,
    tooltips.map((t) => ({
      id: t.key,
      text: t.keyword,
      wholeWord: false,
      render: (match: string) =>
        `<span class="keploy-tt" data-tt-key="${escapeAttr(t.key)}" style="border-bottom:1.5px dotted #f97316;cursor:help;">${match}</span>`,
    })),
    injected,
    TOOLTIP_SKIP_TAGS,
  );
}

export interface InlineInjectionState {
  modalIds: Set<string>;
  tooltipKeys: Set<string>;
}

/**
 * Both inline passes over one chunk of post HTML. Modals run first so an explicit
 * modal anchor wins over a tooltip keyword; the tooltip pass then skips the trigger
 * buttons and never touches their attributes.
 */
export function injectInlineMarkers(
  html: string,
  modals: ContentModalConfig[],
  tooltips: KeywordTooltipConfig[],
  state: InlineInjectionState,
): string {
  return injectTooltipSpans(injectModalTriggers(html, modals, state.modalIds), tooltips, state.tooltipKeys);
}
