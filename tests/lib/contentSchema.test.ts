/**
 * Unit tests for the server-safe content extractors (contentSchema.ts).
 * Run via: `npm run test:unit`.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { detectCodeLanguages, extractFaqs, countWords } from "../../utils/contentSchema";

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

test("countWords ignores HTML tags and entities, counts real words", () => {
  assert.equal(countWords("<p>Hello <strong>world</strong> here</p>"), 3);
  assert.equal(countWords("one&nbsp;two &amp; three"), 4);
});

test("countWords is 0 for empty/nullish input", () => {
  assert.equal(countWords(""), 0);
  assert.equal(countWords(null), 0);
  assert.equal(countWords(undefined), 0);
  assert.equal(countWords("<div></div>"), 0);
});

test("detectCodeLanguages recognizes c++ / c# / csharp classes", () => {
  const html = `<pre class="language-c++"></pre><code class="language-c#"></code><pre class="language-csharp"></pre>`;
  assert.deepEqual([...detectCodeLanguages(html)].sort(), ["C#", "C++"]);
});

test("countWords survives malformed numeric entities without throwing", () => {
  assert.doesNotThrow(() => countWords("&#9999999999; hello world"));
  assert.equal(countWords("&#9999999999; hello world"), 2);
});
