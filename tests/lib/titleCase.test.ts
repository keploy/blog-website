import { test } from "node:test";
import assert from "node:assert/strict";
import { toHeadlineCase } from "../../utils/titleCase";
import { buildPageTitle, clipTitleAtBoundary } from "../../utils/seo";
import { stripPublishPressAuthorBox, pickWpUserForAuthor } from "../../lib/author-box";

test("acronyms, apostrophes and vs are preserved", () => {
  assert.equal(toHeadlineCase("Playwright API Testing"), "Playwright API Testing");
  assert.equal(toHeadlineCase("playwright api testing"), "Playwright API Testing");
  assert.equal(toHeadlineCase("A Developer's Guide to API Mocking"), "A Developer's Guide To API Mocking");
  assert.equal(toHeadlineCase("Unit Testing vs Integration Testing"), "Unit Testing vs Integration Testing");
  assert.equal(toHeadlineCase("Top qa testing tools for ci/cd"), "Top QA Testing Tools For CI/CD");
  assert.equal(toHeadlineCase("gRPC and JSON in JavaScript (sdk)"), "gRPC And JSON In JavaScript (SDK)");
  assert.equal(toHeadlineCase("Debugging in vs code"), "Debugging In VS Code");
});

test("title clip never ends mid-phrase", () => {
  const out = clipTitleAtBoundary("Integration Testing: Complete Guide (Types, Tools & Examples) for 2026", 60);
  assert.equal(out, "Integration Testing: Complete Guide");
  const out2 = buildPageTitle("A Developer's Guide to API Mocking: Benefits, Tools, and Best Practices");
  assert.ok(out2.length <= 60);
  assert.ok(!/(,|and|&|:)$/.test(out2), out2);
});

test("PublishPress box is stripped, content kept", () => {
  const html = `<p>Body</p><!--begin code --><div class="pp-multiple-authors-boxes-wrapper box-post-id-16"><div id="author-description-placeholder"></div></div><!--end code --><style>.pp-multiple-authors-boxes-wrapper.box-post-id-16 img{width:80px}</style><p>After</p>`;
  assert.equal(stripPublishPressAuthorBox(html), "<p>Body</p><p>After</p>");
});

test("WP user is matched by exact name only", () => {
  const users = { edges: [{ node: { name: "Alok Kumar Singh" } }, { node: { name: "Alok Kumar", description: "bio" } }] };
  assert.equal(pickWpUserForAuthor(users, "alok kumar")?.description, "bio");
  assert.equal(pickWpUserForAuthor(users, "Neha"), null);
});
