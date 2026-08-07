/**
 * Unit tests for getBlogPostingSchema hardening (A1 / AI1).
 *
 * Run via: `npm run test:unit`
 *
 * WordPress returns null/malformed values (featuredImage, date, author,
 * excerpt) on many older/migrated posts, and SEMrush flagged 362 posts with
 * invalid structured data as a result. These cases pin the contract that ANY
 * input — including all-null — still produces a schema.org-valid Article, so a
 * regression in the builder's fallbacks fails CI immediately rather than
 * silently shipping invalid schema.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getBlogPostingSchema,
  getOrganizationSchema,
  ORG_ID,
  DEFAULT_ARTICLE_IMAGE_URL,
  AUTHOR_FALLBACK_NAME,
} from "../../lib/structured-data";

const isValidISODate = (v: unknown): boolean =>
  typeof v === "string" && v.length > 0 && !isNaN(new Date(v).getTime());

// The worst case: a migrated post where WP returned nulls for everything.
const nullPost = getBlogPostingSchema({
  title: "A Post With Missing Data",
  url: "https://keploy.io/blog/community/some-post",
  datePublished: "",
  imageUrl: undefined,
  authorName: undefined,
  description: undefined,
});

test("image is always emitted as an ImageObject, even when featuredImage is null", () => {
  assert.ok(nullPost.image, "image must be present");
  const image = nullPost.image as Record<string, unknown>;
  assert.equal(image["@type"], "ImageObject");
  assert.equal(image.url, DEFAULT_ARTICLE_IMAGE_URL);
});

test("a real featuredImage is used and carries the title as caption", () => {
  const withImage = getBlogPostingSchema({
    title: "Real Image Post",
    url: "https://keploy.io/blog/community/x",
    datePublished: "2024-01-02",
    imageUrl: "https://wp.keploy.io/wp-content/uploads/real.png",
  });
  const image = withImage.image as Record<string, unknown>;
  assert.equal(image.url, "https://wp.keploy.io/wp-content/uploads/real.png");
  assert.equal(image.caption, "Real Image Post");
});

test("datePublished is always a valid ISO date, never empty or invalid", () => {
  assert.ok(isValidISODate(nullPost.datePublished), "datePublished must be valid ISO");
  assert.ok(isValidISODate(nullPost.dateModified), "dateModified must be valid ISO");
});

test("an invalid datePublished falls back to a valid dateModified", () => {
  const post = getBlogPostingSchema({
    title: "Bad publish date",
    url: "https://keploy.io/blog/community/y",
    datePublished: "not-a-date",
    dateModified: "2023-05-06",
  });
  assert.ok(isValidISODate(post.datePublished));
  assert.equal(
    new Date(post.datePublished as string).getUTCFullYear(),
    2023,
  );
});

test("author always resolves to a linked Keploy Team Person when missing", () => {
  const author = nullPost.author as Record<string, unknown>;
  assert.equal(author["@type"], "Person");
  assert.equal(author.name, AUTHOR_FALLBACK_NAME);
  assert.equal(author.url, "https://keploy.io/blog/authors/keploy-team");
});

test("description is stripped of HTML tags before entering the schema", () => {
  const post = getBlogPostingSchema({
    title: "HTML excerpt",
    url: "https://keploy.io/blog/community/z",
    datePublished: "2024-01-02",
    description: "<p>Hello <strong>world</strong> &amp; more</p>",
  });
  const desc = post.description as string;
  assert.ok(!/[<>]/.test(desc), "no raw HTML tags should remain");
  assert.ok(desc.includes("Hello world"), "text content is preserved");
});

test("publisher and the Organization node share one stable @id", () => {
  const org = getOrganizationSchema();
  assert.equal(org["@id"], ORG_ID);
  const publisher = nullPost.publisher as Record<string, unknown>;
  assert.equal(publisher["@id"], ORG_ID);
});

test("core required Article fields are always present", () => {
  for (const field of ["@context", "@type", "headline", "author", "publisher", "image", "datePublished"]) {
    assert.ok(nullPost[field] !== undefined, `${field} must be present`);
  }
});

test("technology posts render as TechArticle", () => {
  const tech = getBlogPostingSchema({
    title: "Tech post",
    url: "https://keploy.io/blog/technology/x",
    datePublished: "2024-01-02",
    categorySlug: "technology",
  });
  assert.equal(tech["@type"], "TechArticle");
});
