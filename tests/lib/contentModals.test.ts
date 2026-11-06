/**
 * Unit tests for the content modal trigger injector.
 *
 * Run via: `npm run test:unit`
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { injectInlineMarkers, injectModalTriggers } from "../../lib/content-modals";
import type { ContentModalConfig } from "../../config/content-modals";
import type { KeywordTooltipConfig } from "../../config/keyword-tooltips";

const modal = (id: string, anchorText: string): ContentModalConfig => ({
  id,
  blogSlug: "x",
  anchorText,
  title: "t",
  body: [],
});

const tooltip = (key: string, keyword: string): KeywordTooltipConfig => ({
  key,
  blogSlug: "x",
  keyword,
  media: { type: "image", src: "/t.png" },
  heading: "h",
  ctaText: "c",
  ctaHref: "/",
});

const freshState = () => ({ modalIds: new Set<string>(), tooltipKeys: new Set<string>() });

test("wraps the first match only, preserving original casing", () => {
  const out = injectModalTriggers("<p>Mock APIs. mock apis again.</p>", [modal("m1", "mock apis")], new Set());
  assert.equal((out.match(/data-cm-id="m1"/g) || []).length, 1);
  assert.match(out, /aria-controls="cm-m1">Mock APIs<\/button>/);
});

test("never rewrites attributes or URLs", () => {
  const html = `<p><img alt="mock apis" src="/mock-apis.png"/> plain</p>`;
  assert.equal(injectModalTriggers(html, [modal("m1", "mock apis")], new Set()), html);
});

test("a > inside a quoted attribute does not end the tag", () => {
  const html = `<p title="comparison > strong foundation" data-x='a > mock apis'>A strong foundation matters.</p>`;
  const out = injectModalTriggers(html, [modal("m1", "strong foundation")], new Set());
  assert.ok(out.startsWith(`<p title="comparison > strong foundation" data-x='a > mock apis'>A <button`));
});

test("skips text inside links, headings, code and nested tags, then matches later text", () => {
  const html = `<h2>Mock APIs</h2><p><a href="/x">mock <b>apis</b> mock apis</a> <code>mock apis</code> then mock apis</p>`;
  const out = injectModalTriggers(html, [modal("m1", "mock apis")], new Set());
  assert.match(out, /then <button[^>]*>mock apis<\/button><\/p>$/);
  assert.match(out, /<h2>Mock APIs<\/h2>/);
});

test("two anchors in one text node do not nest inside each other's markup", () => {
  const out = injectModalTriggers(
    "<p>record traffic and replay tests</p>",
    [modal("replay", "replay"), modal("cm-record", "record")],
    new Set(),
  );
  assert.equal(
    out,
    `<p><button type="button" class="keploy-cm-trigger" data-cm-id="cm-record" aria-haspopup="dialog" aria-controls="cm-cm-record">record</button> traffic and ` +
      `<button type="button" class="keploy-cm-trigger" data-cm-id="replay" aria-haspopup="dialog" aria-controls="cm-replay">replay</button> tests</p>`,
  );
});

test("shared set prevents injecting the same modal twice across chunks", () => {
  const injected = new Set<string>();
  injectModalTriggers("<p>mock apis</p>", [modal("m1", "mock apis")], injected);
  const second = injectModalTriggers("<p>mock apis</p>", [modal("m1", "mock apis")], injected);
  assert.equal(second, "<p>mock apis</p>");
  assert.ok(injected.has("m1"));
});

test("unmatched anchors are not marked injected", () => {
  const injected = new Set<string>();
  injectModalTriggers("<p>nothing here</p>", [modal("m1", "mock apis")], injected);
  assert.equal(injected.size, 0);
});

test("a > inside an HTML comment does not leak comment text into matching", () => {
  const html = `<!-- wp:x {"a":"b > strong foundation"} --><p>A strong foundation.</p>`;
  const out = injectModalTriggers(html, [modal("m1", "strong foundation")], new Set());
  assert.ok(out.startsWith(`<!-- wp:x {"a":"b > strong foundation"} --><p>A <button`));
});

test("anchors match whole words only", () => {
  const out = injectModalTriggers("<p>recording traffic, then record it</p>", [modal("m1", "record")], new Set());
  assert.match(out, /<p>recording traffic, then <button[^>]*>record<\/button> it<\/p>/);
  const hyphen = injectModalTriggers("<p>pre-record and record</p>", [modal("m1", "record")], new Set());
  assert.match(hyphen, /pre-record and <button/);
});

test("tooltip pass never rewrites modal trigger attributes", () => {
  const out = injectInlineMarkers(
    "<p>Use basics today. Shift-left wins.</p>",
    [modal("basics-shift-left", "basics")],
    [tooltip("t1", "shift-left")],
    freshState(),
  );
  assert.match(out, /data-cm-id="basics-shift-left" aria-haspopup="dialog" aria-controls="cm-basics-shift-left">basics<\/button>/);
  assert.match(out, /<span class="keploy-tt" data-tt-key="t1"[^>]*>Shift-left<\/span> wins/);
});

test("tooltip keyword inside a modal anchor is not nested in the trigger", () => {
  const state = freshState();
  const out = injectInlineMarkers(
    "<p>Try shift-left testing now.</p>",
    [modal("m1", "shift-left testing")],
    [tooltip("t1", "shift-left")],
    state,
  );
  assert.match(out, /<button[^>]*>shift-left testing<\/button>/);
  assert.doesNotMatch(out, /keploy-tt/);
  assert.ok(!state.tooltipKeys.has("t1"));
});

test("tooltips skip attributes but still apply inside links", () => {
  const out = injectInlineMarkers(
    `<p><a href="/mock-apis" title="mock apis">mock apis</a></p>`,
    [],
    [tooltip("t1", "mock apis")],
    freshState(),
  );
  assert.equal(
    out,
    `<p><a href="/mock-apis" title="mock apis"><span class="keploy-tt" data-tt-key="t1" style="border-bottom:1.5px dotted #f97316;cursor:help;">mock apis</span></a></p>`,
  );
});
