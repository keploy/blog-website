import { test } from "node:test";
import assert from "node:assert/strict";
import { toHeadlineCase } from "../../utils/titleCase";
import { buildPageTitle, clipTitleAtBoundary } from "../../utils/seo";
import { stripPublishPressAuthorBox, pickWpUserForAuthor, toPublicAuthor } from "../../lib/author-box";

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

test("prototype keys are not acronyms", () => {
  assert.equal(toHeadlineCase("the constructor pattern and toString"), "The Constructor Pattern And toString");
  assert.equal(toHeadlineCase("valueof hasownproperty"), "Valueof Hasownproperty");
});

test("C++ survives clipping", () => {
  assert.equal(clipTitleAtBoundary("Unit Testing in C++ Using GoogleTest and Catch2 Frameworks Today", 20), "Unit Testing in C++");
  assert.equal(clipTitleAtBoundary("Testing tips + tricks for great modern backend developers here", 15), "Testing tips");
});

test("unmatched parens, nested and at position 0", () => {
  assert.equal(clipTitleAtBoundary("Guide (Types (Unit, API), Tools and more stuff here", 30), "Guide");
  assert.equal(clipTitleAtBoundary("Guide (Types) and (More, Tools and stuff here", 30), "Guide (Types)");
  const out = clipTitleAtBoundary("(Draft) Testing (Unit, Integration, Contract, E2E things", 40);
  assert.equal(out, "(Draft) Testing");
  const zero = clipTitleAtBoundary("(Unclosed testing guide for API and more words here", 30);
  assert.ok(!zero.includes("("), zero);
});

test("strip keeps an earlier unrelated code block", () => {
  const html = `<!--begin code --><pre>keep me</pre><!--end code --><p>Mid</p><!--begin code --><div class="pp-multiple-authors-boxes-wrapper"></div><!--end code --><p>End</p>`;
  assert.equal(stripPublishPressAuthorBox(html), `<!--begin code --><pre>keep me</pre><!--end code --><p>Mid</p><p>End</p>`);
});

test("toPublicAuthor never carries email", () => {
  const pub = toPublicAuthor({ name: "A", description: "b", avatar: { url: "u" }, email: "a@x.io" } as any);
  assert.deepEqual(pub, { name: "A", avatar: { url: "u" }, description: "b" });
});
