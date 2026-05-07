/**
 * Unit tests for getHowToSchema.
 *
 * Run via: `npm run test:unit`
 *
 * Covers the HowTo JSON-LD path that the e2e suite can't reach today —
 * there are no tutorial-tagged posts in WP yet, so an end-to-end test
 * would silently pass even if the helper stopped emitting (or started
 * emitting on every post). These cases pin the contract to controlled
 * fixtures so a regression in tag detection, step extraction, or entity
 * decoding fails CI immediately.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { getHowToSchema, type TutorialPostShape } from "../../lib/howToSchema";

const TUTORIAL_TAGS = {
  edges: [{ node: { name: "tutorial" } }],
};

const NON_TUTORIAL_TAGS = {
  edges: [{ node: { name: "engineering" } }, { node: { name: "case-study" } }],
};

const SAMPLE_TUTORIAL_BODY = `
<p>Intro paragraph.</p>
<h2>Install Keploy</h2>
<p>Run the install script and verify the binary.</p>
<h2>Capture API traffic</h2>
<p>Start the app under <code>keploy record</code>.</p>
<h3>Tip</h3>
<p>Pipe traffic through curl to seed test cases.</p>
`;

const PAGE_URL = "https://keploy.io/blog/sample-howto-post";
const SAFE_TITLE = "Sample HowTo Post";
const SAFE_DESCRIPTION = "Walks through a minimal Keploy capture/replay cycle.";

function makePost(overrides: Partial<TutorialPostShape> = {}): TutorialPostShape {
  return {
    title: "Sample HowTo Post",
    slug: "sample-howto-post",
    content: SAMPLE_TUTORIAL_BODY,
    date: "2026-04-01T00:00:00Z",
    tags: TUTORIAL_TAGS,
    ...overrides,
  };
}

test("emits HowTo schema for tutorial-tagged posts with >= 2 usable steps", () => {
  const schema = getHowToSchema(makePost(), PAGE_URL, SAFE_TITLE, SAFE_DESCRIPTION);

  assert.ok(schema, "expected a schema object");
  assert.equal(schema!["@context"], "https://schema.org");
  assert.equal(schema!["@type"], "HowTo");
  assert.equal(schema!.name, SAFE_TITLE);
  assert.equal(schema!.description, SAFE_DESCRIPTION);

  const steps = schema!.step as Array<Record<string, unknown>>;
  assert.equal(steps.length, 3);
  assert.equal(steps[0].name, "Install Keploy");
  assert.equal(steps[0].position, 1);
  assert.match(steps[0].text as string, /install script/);
  assert.equal(steps[2].name, "Tip");
});

test("returns null for posts not tagged tutorial / how-to / howto", () => {
  const schema = getHowToSchema(
    makePost({ tags: NON_TUTORIAL_TAGS }),
    PAGE_URL,
    SAFE_TITLE,
    SAFE_DESCRIPTION,
  );
  assert.equal(schema, null);
});

test("matches tag names case-insensitively and across whitespace variants", () => {
  for (const variant of ["How To", "HOWTO", "how-to", "Tutorial"]) {
    const schema = getHowToSchema(
      makePost({ tags: { edges: [{ node: { name: variant } }] } }),
      PAGE_URL,
      SAFE_TITLE,
      SAFE_DESCRIPTION,
    );
    assert.ok(schema, `expected emission for tag "${variant}"`);
  }
});

test("returns null when fewer than 2 steps can be extracted", () => {
  const schema = getHowToSchema(
    makePost({
      content: "<h2>Only one step</h2><p>This is the only step.</p>",
    }),
    PAGE_URL,
    SAFE_TITLE,
    SAFE_DESCRIPTION,
  );
  assert.equal(schema, null);
});

test("decodes WordPress numeric entities in step text and headings", () => {
  // &#8217; (curly apostrophe), &#8211; (en dash), and the structural
  // &lt;/&gt; pair WP emits for inline code blocks. Assert the entities
  // are replaced with proper Unicode and that no `&lt;`/`&gt;` literals
  // leak into the JSON-LD payload.
  const schema = getHowToSchema(
    makePost({
      content: `
        <h2>It&#8217;s easy &#8211; really</h2>
        <p>Use &lt;keploy record&gt; to start &#8211; then exercise the API.</p>
        <h2>Replay</h2>
        <p>Run &#8220;keploy test&#8221; to replay.</p>
      `,
    }),
    PAGE_URL,
    SAFE_TITLE,
    SAFE_DESCRIPTION,
  );

  assert.ok(schema);
  const steps = schema!.step as Array<Record<string, unknown>>;
  // utils/seo.ts decodes &#8217; → ASCII apostrophe and &#8211; →
  // U+2013 en dash; pin those exact substitutions so a future change to
  // the decode table can't quietly flip what crawlers see.
  assert.equal(steps[0].name, "It's easy – really");
  assert.match(steps[0].text as string, /– then exercise/);
  // `&lt;` / `&gt;` are intentionally left as entities (script-context
  // safety: see utils/seo.ts decodeEntities note) — they must NOT be
  // decoded into raw `<`/`>` in the JSON-LD body.
  assert.doesNotMatch(steps[0].text as string, /<keploy record>/);
  assert.equal(steps[1].text, "Run “keploy test” to replay.");
});

test("schema carries page url via mainEntityOfPage", () => {
  const schema = getHowToSchema(makePost(), PAGE_URL, SAFE_TITLE, SAFE_DESCRIPTION);
  assert.ok(schema);
  const main = schema!.mainEntityOfPage as Record<string, unknown>;
  assert.equal(main["@type"], "WebPage");
  assert.equal(main["@id"], PAGE_URL);
});

test("returns null on missing post or empty title", () => {
  assert.equal(getHowToSchema(null, PAGE_URL, SAFE_TITLE, SAFE_DESCRIPTION), null);
  assert.equal(getHowToSchema(undefined, PAGE_URL, SAFE_TITLE, SAFE_DESCRIPTION), null);
  assert.equal(getHowToSchema(makePost(), PAGE_URL, "", SAFE_DESCRIPTION), null);
});
