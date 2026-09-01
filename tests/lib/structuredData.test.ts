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
  getItemListSchema,
  getReviewSchema,
  getSoftwareApplicationSchema,
  ORG_ID,
  BLOG_ID,
  WEBSITE_ID,
  SOFTWARE_ID,
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

test("dates are omitted (never fabricated) when WP gives nothing usable", () => {
  // The builder must not invent a date via new Date() — that ran in the page
  // render body and caused an ld+json hydration mismatch + a publish date that
  // drifted on every ISR revalidate. A missing date is a soft warning; a
  // fabricated one is invalid data.
  assert.ok(!("datePublished" in nullPost), "no fabricated datePublished");
  assert.ok(!("dateModified" in nullPost), "no fabricated dateModified");
});

test("a valid date is emitted as ISO and dateModified falls back to it", () => {
  const post = getBlogPostingSchema({
    title: "Dated post",
    url: "https://keploy.io/blog/community/dated",
    datePublished: "2024-01-02",
  });
  assert.ok(isValidISODate(post.datePublished), "datePublished must be valid ISO");
  assert.equal(post.dateModified, post.datePublished);
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

test("a missing author falls back to a url-less Keploy Team Person (no soft-404 link)", () => {
  const author = nullPost.author as Record<string, unknown>;
  assert.equal(author["@type"], "Person");
  assert.equal(author.name, AUTHOR_FALLBACK_NAME);
  // The fallback has no /authors/{slug} page, so it must not link out to one.
  assert.ok(!("url" in author), "fallback author must be url-less");
  assert.ok(!("@id" in author), "fallback author carries no profile @id");
});

test("a real author gets its /authors/{slug} profile url and @id", () => {
  const post = getBlogPostingSchema({
    title: "Named author post",
    url: "https://keploy.io/blog/community/named",
    datePublished: "2024-01-02",
    authorName: "Jane Doe",
  });
  const author = post.author as Record<string, unknown>;
  assert.equal(author.url, "https://keploy.io/blog/authors/jane-doe");
  assert.equal(author["@id"], "https://keploy.io/blog/authors/jane-doe#person");
  const worksFor = author.worksFor as Record<string, unknown>;
  assert.equal(worksFor["@id"], ORG_ID);
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
  // datePublished intentionally excluded — it's omitted, not fabricated, when
  // WP has no usable date (see the date-omission test above).
  for (const field of ["@context", "@type", "headline", "author", "publisher", "image"]) {
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

test("getItemListSchema returns null when no items survive the name/url filter", () => {
  // An ItemList with an empty itemListElement is invalid schema — the builder
  // must return null (e.g. an author whose posts all have null titles).
  assert.equal(getItemListSchema([]), null);
  assert.equal(getItemListSchema([{ url: "", name: "" }]), null);
  const ok = getItemListSchema([{ url: "https://keploy.io/blog/community/x", name: "X" }]);
  assert.ok(ok && (ok as any).itemListElement.length === 1);
});

test("getItemListSchema declares numberOfItems matching the surviving elements", () => {
  const list = getItemListSchema([
    { url: "https://keploy.io/blog/community/a", name: "A" },
    { url: "", name: "dropped" }, // filtered out
    { url: "https://keploy.io/blog/community/b", name: "B" },
  ]) as Record<string, unknown>;
  // numberOfItems must reflect what actually shipped, not the raw input length.
  assert.equal(list.numberOfItems, 2);
  assert.equal((list.itemListElement as unknown[]).length, 2);
});

test("getCollectionPageSchema's ItemList carries a matching numberOfItems", () => {
  const collection = getCollectionPageSchema({
    name: "Community",
    url: `${"https://keploy.io/blog"}/community`,
    items: [
      { url: "https://keploy.io/blog/community/a", name: "A" },
      { url: "https://keploy.io/blog/community/b", name: "B" },
    ],
  }) as Record<string, unknown>;
  const mainEntity = collection.mainEntity as Record<string, unknown>;
  assert.equal(mainEntity.numberOfItems, 2);
});

test("getBlogPostingSchema marks the article as free to read", () => {
  const post = getBlogPostingSchema({
    title: "A Free Post",
    url: "https://keploy.io/blog/community/free-post",
    datePublished: "2024-01-01",
  });
  // The blog content is free (distinct from the paid-tier product, which
  // deliberately omits this on getSoftwareApplicationSchema).
  assert.equal(post.isAccessibleForFree, true);
});

test("getWebSiteSchema links to the Keploy Organization by the shared @id", () => {
  const site = getWebSiteSchema();
  const publisher = site.publisher as Record<string, unknown>;
  assert.equal(publisher["@type"], "Organization");
  assert.equal(publisher["@id"], ORG_ID);
  assert.equal(site.inLanguage, "en-US");
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

// ── SoftwareApplication (AI-citation entity anchor) ──────────────────────────

test("getSoftwareApplicationSchema is a valid, price-less, rating-less software entity", () => {
  const app = getSoftwareApplicationSchema() as Record<string, unknown>;
  assert.equal(app["@type"], "SoftwareApplication");
  assert.equal(app["@id"], SOFTWARE_ID);
  assert.equal(app.applicationCategory, "DeveloperApplication");
  assert.ok(typeof app.operatingSystem === "string" && (app.operatingSystem as string).length > 0);
  // No free/price claim: the node is named "Keploy" (the whole product), which
  // ships paid tiers, so a blanket offers price 0 / isAccessibleForFree would
  // be inaccurate. See PR review #6.
  assert.ok(!("offers" in app), "no blanket price claim");
  assert.ok(!("isAccessibleForFree" in app), "no blanket free claim");
  // Shares the one Keploy Organization @id so the graph stays a single entity.
  const publisher = app.publisher as Record<string, unknown>;
  assert.equal(publisher["@id"], ORG_ID);
  assert.ok(Array.isArray(app.sameAs) && (app.sameAs as unknown[]).length > 0);
  // Same policy as reviews/ratings: no fabricated aggregate rating.
  assert.ok(!("aggregateRating" in app), "no self-serving AggregateRating");
});

// ── Article entity-graph + content signals ───────────────────────────────────

test("every post mentions the single Keploy SoftwareApplication by @id", () => {
  const mentions = (nullPost.mentions as Record<string, unknown>[]) || [];
  assert.ok(mentions.length >= 1, "mentions must be present");
  const soft = mentions.find((m) => m["@type"] === "SoftwareApplication");
  assert.ok(soft, "a SoftwareApplication mention must exist");
  assert.equal(soft!["@id"], SOFTWARE_ID);
});

test("post always declares inLanguage", () => {
  assert.equal(nullPost.inLanguage, "en-US");
});

test("wordCount / timeRequired / keywords are emitted only when provided", () => {
  // Omitted on the all-null post.
  assert.ok(!("wordCount" in nullPost), "no wordCount when unset");
  assert.ok(!("timeRequired" in nullPost), "no timeRequired when unset");
  assert.ok(!("keywords" in nullPost), "no keywords when unset");

  const rich = getBlogPostingSchema({
    title: "Rich signals post",
    url: "https://keploy.io/blog/technology/rich",
    datePublished: "2024-01-02",
    wordCount: 1200,
    readingTimeMinutes: 7,
    keywords: ["Testing", "Go", "Testing", ""],
  });
  assert.equal(rich.wordCount, 1200);
  assert.equal(rich.timeRequired, "PT7M");
  // De-duped + empties dropped, comma-joined.
  assert.equal(rich.keywords, "Testing, Go");
});

test("root-relative image URLs are coerced to absolute in the schema", () => {
  const post = getBlogPostingSchema({
    title: "Rel image",
    url: "https://keploy.io/blog/community/rel",
    datePublished: "2024-01-02",
    imageUrl: "/blog/favicon/Group.png",
  });
  const image = post.image as Record<string, unknown>;
  assert.equal(image.url, "https://keploy.io/blog/favicon/Group.png");
});
