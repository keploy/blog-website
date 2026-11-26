/**
 * Unit tests for the render-time link normalizer applied to WordPress post
 * bodies. Run via: `npm run test:unit`
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeContentLinks,
  normalizeKeployHref,
} from "../../lib/normalize-content-links";

const B = "https://keploy.io/blog";

test("strips trailing slashes on blog urls, keeps the fragment", () => {
  assert.equal(
    normalizeKeployHref(`${B}/community/what-is-unit-testing/`),
    `${B}/community/what-is-unit-testing`,
  );
  assert.equal(
    normalizeKeployHref(`${B}/community/what-is-unit-testing/#setup`),
    `${B}/community/what-is-unit-testing#setup`,
  );
  assert.equal(normalizeKeployHref(`${B}/community/`), `${B}/community`);
});

test("collapses doubled slashes and trailing junk in blog paths", () => {
  assert.equal(
    normalizeKeployHref(`${B}/community//what-is-api-contract-testing`),
    `${B}/community/what-is-api-contract-testing`,
  );
  assert.equal(
    normalizeKeployHref(`${B}/community/what-is-ad-hoc-testing://`),
    `${B}/community/what-is-ad-hoc-testing`,
  );
});

test("scheme-less keploy.io hrefs become absolute", () => {
  assert.equal(normalizeKeployHref("keploy.io"), "https://keploy.io/");
  assert.equal(normalizeKeployHref("keploy.io/slack"), "https://keploy.io/slack");
  assert.equal(normalizeKeployHref("http://keploy.io"), "https://keploy.io/");
  assert.equal(normalizeKeployHref("https://www.keploy.io/"), "https://keploy.io/");
});

test("drops utm_source=chatgpt.com and keeps other params", () => {
  assert.equal(
    normalizeKeployHref(`${B}/community/qa-automation-revolutionizing-software-testing?utm_source=chatgpt.com`),
    `${B}/community/qa-automation-revolutionizing-software-testing`,
  );
  assert.equal(
    normalizeKeployHref(`${B}/community/x?utm_source=chatgpt.com&amp;ref=1`),
    `${B}/community/x?ref=1`,
  );
});

test("maps renamed slugs to their final target, following chains", () => {
  assert.equal(
    normalizeKeployHref(`${B}/community/everything-you-need-to-know-about-api-testing`),
    `${B}/community/what-is-api-testing`,
  );
  assert.equal(
    normalizeKeployHref(`${B}/community/gemini-pro-vs-openai-benchmark-ai-for-software-testing`),
    `${B}/technology/gemini-pro-vs-openai-benchmark-ai-for-software-testing`,
  );
  assert.equal(
    normalizeKeployHref(`${B}/technology/mastering-test-coverage-quality-over-quantity-in-software-testing?utm_source=chatgpt.com`),
    `${B}/community/mastering-test-coverage-quality-over-quantity-in-software-testing`,
  );
  assert.equal(
    normalizeKeployHref(`${B}/community/rest-vs-graphql-whats-the-differenc`),
    `${B}/community/rest-vs-graphql-whats-the-difference`,
  );
});

test("leaves clean, non-blog and non-keploy links untouched", () => {
  for (const href of [
    `${B}/community/what-is-unit-testing`,
    "https://keploy.io/docs/server/installation/",
    "https://keploy.io/",
    "https://app.keploy.io/",
    "https://example.com/blog/foo/",
    "/blog/community/foo",
    "#section",
    "mailto:hello@keploy.io",
    "",
  ]) {
    assert.equal(normalizeKeployHref(href), href, href);
  }
});

test("normalizeContentLinks rewrites only the href of anchor tags", () => {
  const html =
    `<p><a class="x" href="${B}/community//what-is-low-code-and-no-code/">a</a>` +
    `<a data-href="keploy.io" href='keploy.io/slack'>b</a>` +
    `<img src="${B}/community/foo/"><a href="https://github.com/keploy/">c</a></p>`;
  assert.equal(
    normalizeContentLinks(html),
    `<p><a class="x" href="${B}/community/what-is-low-code-and-no-code">a</a>` +
      `<a data-href="keploy.io" href='https://keploy.io/slack'>b</a>` +
      `<img src="${B}/community/foo/"><a href="https://github.com/keploy/">c</a></p>`,
  );
});
