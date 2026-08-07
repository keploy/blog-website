/**
 * Unit tests for the server-safe content extractors (contentSchema.ts).
 * Run via: `npm run test:unit`.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { detectCodeLanguages, extractFaqs } from "../../utils/contentSchema";

test("detectCodeLanguages dedupes and normalizes language- classes", () => {
  const html = `<pre class="language-go"></pre><code class="language-py"></code><pre class="language-golang"></pre>`;
  const langs = detectCodeLanguages(html);
  assert.deepEqual([...langs].sort(), ["Go", "Python"]);
});

test("detectCodeLanguages returns empty for no code", () => {
  assert.deepEqual(detectCodeLanguages("<p>no code here</p>"), []);
  assert.deepEqual(detectCodeLanguages(undefined), []);
});

test("extractFaqs pulls question headings + answers, needs >= 2", () => {
  const html = `
    <h2>What is API testing?</h2><p>It validates API behavior against expectations.</p>
    <h3>How does Keploy record traffic?</h3><p>It captures real calls and turns them into test cases automatically.</p>
  `;
  const faqs = extractFaqs(html);
  assert.equal(faqs.length, 2);
  assert.equal(faqs[0].question, "What is API testing?");
  assert.ok(faqs[0].answer.includes("validates API behavior"));
});

test("extractFaqs returns empty when fewer than 2 question headings", () => {
  assert.deepEqual(extractFaqs("<h2>What is X?</h2><p>An answer long enough here.</p>"), []);
  assert.deepEqual(extractFaqs("<h2>Not a question</h2><p>body</p>"), []);
});
