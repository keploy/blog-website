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

test("extractFaqs pulls Q&A only from an explicit FAQ section, needs >= 2", () => {
  const html = `
    <h2>Intro</h2><p>Some framing prose that is not a FAQ answer at all.</p>
    <h2>Frequently Asked Questions</h2>
    <h3>What is API testing?</h3><p>It validates API behavior against expectations.</p>
    <h3>How does Keploy record traffic?</h3><p>It captures real calls and turns them into test cases automatically.</p>
    <h2>Conclusion</h2><p>Wrap up prose.</p>
  `;
  const faqs = extractFaqs(html);
  assert.equal(faqs.length, 2);
  assert.equal(faqs[0].question, "What is API testing?");
  assert.ok(faqs[0].answer.includes("validates API behavior"));
});

test("extractFaqs requires the FAQ marker — stray '?' headings are ignored", () => {
  // Two question headings but NO FAQ marker section → nothing (this was the
  // over-eager scrape the review flagged).
  const noMarker = `
    <h2>What is X?</h2><p>An answer long enough to pass the length gate here.</p>
    <h2>Why does Y matter?</h2><p>Another sufficiently long answer paragraph here.</p>
  `;
  assert.deepEqual(extractFaqs(noMarker), []);
});

test("extractFaqs accepts questions at the same heading level as the marker", () => {
  const html = `
    <h2>FAQ</h2>
    <h2>What is API testing?</h2><p>It validates API behavior against expectations.</p>
    <h2>How does Keploy help?</h2><p>It generates tests and mocks from real traffic.</p>
    <h2>Conclusion</h2><p>Not part of the FAQ.</p>
  `;
  const faqs = extractFaqs(html);
  assert.equal(faqs.length, 2);
  assert.ok(!faqs.some((f) => f.question.toLowerCase().includes("conclusion")));
});

test("extractFaqs answers skip code/tables, taking paragraph text only", () => {
  const html = `
    <h2>FAQ</h2>
    <h3>How do I install it?</h3>
    <pre><code>npm install keploy && keploy --version</code></pre>
    <p>Run the installer, then verify the version from your terminal.</p>
    <h3>Is it open source?</h3><p>Yes, the core is open source on GitHub.</p>
  `;
  const faqs = extractFaqs(html);
  assert.equal(faqs.length, 2);
  assert.ok(!faqs[0].answer.includes("npm install"), "code block must not leak into the answer");
  assert.ok(faqs[0].answer.includes("Run the installer"));
});

test("extractFaqs includes <li> list answers (WP FAQ sections often use bullets)", () => {
  const html = `
    <h2>FAQ</h2>
    <h3>What does Keploy record?</h3><ul><li>HTTP calls and their dependencies during a real run.</li></ul>
    <h3>Does it need code changes?</h3><ul><li>No code changes are required to start recording.</li></ul>
  `;
  const faqs = extractFaqs(html);
  assert.equal(faqs.length, 2);
  assert.ok(faqs[0].answer.includes("HTTP calls"), "bulleted answer must be captured");
  assert.ok(faqs[1].answer.includes("No code changes"));
});

test("extractFaqs decodes &lt;/&gt; so answers carry real angle brackets, not entities", () => {
  const html = `
    <h2>FAQ</h2>
    <h3>How do I start recording traffic?</h3><p>Run &lt;keploy record&gt; in your terminal to begin.</p>
    <h3>Is it open source?</h3><p>Yes, the core is open source on GitHub for everyone.</p>
  `;
  const faqs = extractFaqs(html);
  assert.equal(faqs.length, 2);
  assert.ok(faqs[0].answer.includes("<keploy record>"), "angle brackets should be decoded");
  assert.ok(!faqs[0].answer.includes("&lt;"), "no literal entity should remain");
});

test("extractFaqs returns empty for an FAQ marker with fewer than 2 pairs", () => {
  assert.deepEqual(
    extractFaqs("<h2>FAQ</h2><h3>What is X?</h3><p>An answer long enough here to pass.</p>"),
    [],
  );
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
