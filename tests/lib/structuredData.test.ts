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
  getBlogSchema,
  getWebSiteSchema,
  getCollectionPageSchema,
  getSearchResultsPageSchema,
  getReviewSchema,
  ORG_ID,
  BLOG_ID,
  WEBSITE_ID,
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

test("the Blog node and every isPartOf reference share one stable @id", () => {
  const blog = getBlogSchema();
  assert.equal(blog["@id"], BLOG_ID);
  const isPartOf = nullPost.isPartOf as Record<string, unknown>;
  assert.equal(isPartOf["@id"], BLOG_ID, "a post's isPartOf must reference the Blog entity");
  const collection = getCollectionPageSchema({
    name: "Technology",
    url: "https://keploy.io/blog/technology",
    items: [],
  });
  const collectionIsPartOf = collection.isPartOf as Record<string, unknown>;
  assert.equal(collectionIsPartOf["@id"], BLOG_ID, "a listing's isPartOf must reference it too");
});

test("the WebSite node and the search page's isPartOf share one stable @id", () => {
  assert.equal(getWebSiteSchema()["@id"], WEBSITE_ID);
  const search = getSearchResultsPageSchema({ url: "https://keploy.io/blog/search" });
  const searchIsPartOf = search.isPartOf as Record<string, unknown>;
  assert.equal(searchIsPartOf["@id"], WEBSITE_ID);
});

test("the author Person links to the same Organization @id via worksFor", () => {
  const author = nullPost.author as Record<string, unknown>;
  const worksFor = author.worksFor as Record<string, unknown>;
  assert.ok(worksFor, "author must carry a worksFor affiliation");
  assert.equal(worksFor["@type"], "Organization");
  assert.equal(worksFor["@id"], ORG_ID);
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

// Review schema (home testimonials). The community wall carries no star
// values, so these pin that the builder emits VALID, rating-less reviews and
// never fabricates a Rating/AggregateRating (which require a ratingValue and
// would re-introduce the invalid-structured-data failures this branch clears).
const sampleReviews = [
  { author: "Jay Vasant", body: "Keploy makes maintaining tests far easier.", url: "https://x.com/a/status/1" },
  { author: "matsuu", body: "eBPF-based test generation is amazing." },
];

test("getReviewSchema returns null when there are no usable reviews", () => {
  assert.equal(getReviewSchema([]), null);
  assert.equal(getReviewSchema([{ author: "", body: "" }]), null);
});

test("reviews attach to the Keploy Organization by the shared @id (no fragmentation)", () => {
  const node = getReviewSchema(sampleReviews) as Record<string, unknown>;
  assert.equal(node["@type"], "Organization");
  assert.equal(node["@id"], ORG_ID);
  assert.ok(Array.isArray(node.review));
});

test("entries missing an author or body are dropped", () => {
  const node = getReviewSchema([
    ...sampleReviews,
    { author: "No body", body: "" },
    { author: "", body: "No author" },
  ]) as Record<string, unknown>;
  assert.equal((node.review as unknown[]).length, sampleReviews.length);
});

test("each Review is valid and rating-less, url only when present", () => {
  const node = getReviewSchema(sampleReviews) as Record<string, unknown>;
  const reviews = node.review as Record<string, unknown>[];
  for (const r of reviews) {
    assert.equal(r["@type"], "Review");
    const author = r.author as Record<string, unknown>;
    assert.equal(author["@type"], "Person");
    assert.ok(typeof r.reviewBody === "string" && (r.reviewBody as string).length > 0);
    assert.ok(!("reviewRating" in r), "no fabricated star rating");
  }
  assert.equal(reviews[0].url, sampleReviews[0].url);
  assert.ok(!("url" in reviews[1]), "no url key when the source has none");
  assert.ok(!("aggregateRating" in node), "no self-serving AggregateRating");
});
