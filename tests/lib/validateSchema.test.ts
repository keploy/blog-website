/**
 * Unit tests for the JSON-LD schema linter (scripts/validate-schema.ts).
 *
 * Run via: `npm run test:unit`
 *
 * These pin the rule contract so a change that weakens the lint (or a new
 * builder that reintroduces a flagged pattern) fails CI immediately. The linter
 * is pure over raw JSON-LD block strings — no server needed here; the live
 * sweep lives in the script's `run()` and is exercised via `npm run
 * validate:schema` against a running app.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { extractJsonLdBlocks, lintBlocks } from "../../scripts/validate-schema";

const block = (o: unknown) => JSON.stringify(o);

test("extractJsonLdBlocks pulls every ld+json script body", () => {
  const html = `
    <head>
      <script type="application/ld+json">{"@type":"WebSite"}</script>
      <script src="/x.js"></script>
      <script type='application/ld+json'>{"@type":"Organization"}</script>
    </head>`;
  const blocks = extractJsonLdBlocks(html);
  assert.equal(blocks.length, 2);
  assert.ok(blocks[0].includes("WebSite"));
  assert.ok(blocks[1].includes("Organization"));
});

test("malformed JSON is an error", () => {
  const findings = lintBlocks(["{ not json }"]);
  assert.ok(findings.some((f) => f.rule === "malformed-json" && f.severity === "error"));
});

test("a node without @type is an error", () => {
  const findings = lintBlocks([block({ "@context": "https://schema.org", name: "x" })]);
  assert.ok(findings.some((f) => f.rule === "missing-type" && f.severity === "error"));
});

test("eligibleCustomerType with a schema.org value is an error (deep-walked)", () => {
  const findings = lintBlocks([
    block({
      "@context": "https://schema.org",
      "@type": "Product",
      offers: { "@type": "Offer", eligibleCustomerType: "https://schema.org/Business" },
    }),
  ]);
  assert.ok(
    findings.some(
      (f) => f.rule === "eligibleCustomerType-schemaorg-value" && f.severity === "error",
    ),
  );
});

test("codeRepository/programmingLanguage on SoftwareApplication warns", () => {
  const findings = lintBlocks([
    block({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      codeRepository: "https://github.com/keploy/keploy",
      programmingLanguage: ["Go"],
    }),
  ]);
  const hits = findings.filter((f) => f.rule === "softwareapplication-wrong-prop");
  assert.equal(hits.length, 2);
  assert.ok(hits.every((f) => f.severity === "warning"));
});

test("same @id on two different @types warns (entity collision)", () => {
  const findings = lintBlocks([
    block({ "@context": "https://schema.org", "@type": "Organization", "@id": "https://keploy.io/#x" }),
    block({ "@context": "https://schema.org", "@type": "WebSite", "@id": "https://keploy.io/#x" }),
  ]);
  assert.ok(findings.some((f) => f.rule === "duplicate-id" && f.severity === "warning"));
});

test("same @id on the SAME @type does not warn (valid reference)", () => {
  const findings = lintBlocks([
    block({ "@context": "https://schema.org", "@type": "Organization", "@id": "https://keploy.io/#org" }),
    block({ "@context": "https://schema.org", "@type": "Organization", "@id": "https://keploy.io/#org" }),
  ]);
  assert.ok(!findings.some((f) => f.rule === "duplicate-id"));
});

test("reviewedBy on a BlogPosting warns; on a WebPage it does not", () => {
  const onPost = lintBlocks([
    block({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "X",
      datePublished: "2026-01-01",
      reviewedBy: { "@type": "Person", name: "R" },
    }),
  ]);
  assert.ok(onPost.some((f) => f.rule === "reviewedby-non-webpage" && f.severity === "warning"));

  const onWebPage = lintBlocks([
    block({
      "@context": "https://schema.org",
      "@type": "WebPage",
      reviewedBy: { "@type": "Person", name: "R" },
    }),
  ]);
  assert.ok(!onWebPage.some((f) => f.rule === "reviewedby-non-webpage"));
});

test("Article missing datePublished warns; a complete Article is clean", () => {
  const missing = lintBlocks([
    block({ "@context": "https://schema.org", "@type": "BlogPosting", headline: "X" }),
  ]);
  assert.ok(
    missing.some(
      (f) => f.rule === "article-missing-recommended-field" && /datePublished/.test(f.message),
    ),
  );

  const complete = lintBlocks([
    block({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "X",
      datePublished: "2026-01-01",
    }),
  ]);
  assert.ok(!complete.some((f) => f.rule === "article-missing-recommended-field"));
});

test("@type as an array is handled (BlogPosting inside a union still lints)", () => {
  const findings = lintBlocks([
    block({
      "@context": "https://schema.org",
      "@type": ["BlogPosting", "Article"],
      headline: "X",
    }),
  ]);
  // datePublished missing → warned; type union resolved correctly.
  assert.ok(findings.some((f) => f.rule === "article-missing-recommended-field"));
});

test("a representative valid post payload produces zero findings", () => {
  const findings = lintBlocks([
    block({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://keploy.io/blog" }],
    }),
    block({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "A valid post",
      datePublished: "2026-02-05T06:47:52.000Z",
      author: { "@type": "Person", name: "Author" },
    }),
    block({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://keploy.io/blog/x#faq",
      mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A" } }],
    }),
    block({ "@context": "https://schema.org", "@type": "Organization", "@id": "https://keploy.io/#organization" }),
  ]);
  assert.deepEqual(findings, []);
});
