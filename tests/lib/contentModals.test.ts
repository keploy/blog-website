/**
 * Unit tests for the content modal trigger injector.
 *
 * Run via: `npm run test:unit`
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { injectModalTriggers } from "../../lib/content-modals";
import type { ContentModalConfig } from "../../config/content-modals";

const modal = (id: string, anchorText: string): ContentModalConfig => ({
  id,
  blogSlug: "x",
  anchorText,
  title: "t",
  body: [],
});

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
