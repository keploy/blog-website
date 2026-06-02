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

function makePost(
  overrides: Partial<TutorialPostShape> = {},
): TutorialPostShape {
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
  const schema = getHowToSchema(
    makePost(),
    PAGE_URL,
    SAFE_TITLE,
    SAFE_DESCRIPTION,
  );

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
  // &lt;/&gt; pair WP emits for inline code blocks. Assert that the
  // numeric punctuation entities ARE replaced with proper Unicode while
  // `&lt;`/`&gt;` are intentionally LEFT as entities — decodeEntities()
  // in utils/seo.ts deliberately skips them so a literal `</script>` can
  // never land inside the JSON-LD `<script>` body.
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
  // decoded into raw `<`/`>` in the JSON-LD body, and the entity form
  // must survive into the emitted payload.
  assert.doesNotMatch(steps[0].text as string, /<keploy record>/);
  assert.match(steps[0].text as string, /&lt;keploy record&gt;/);
  assert.equal(steps[1].text, "Run “keploy test” to replay.");
});

test("schema carries page url via mainEntityOfPage", () => {
  const schema = getHowToSchema(
    makePost(),
    PAGE_URL,
    SAFE_TITLE,
    SAFE_DESCRIPTION,
  );
  assert.ok(schema);
  const main = schema!.mainEntityOfPage as Record<string, unknown>;
  assert.equal(main["@type"], "WebPage");
  assert.equal(main["@id"], PAGE_URL);
});

test("returns null on missing post or empty title", () => {
  assert.equal(
    getHowToSchema(null, PAGE_URL, SAFE_TITLE, SAFE_DESCRIPTION),
    null,
  );
  assert.equal(
    getHowToSchema(undefined, PAGE_URL, SAFE_TITLE, SAFE_DESCRIPTION),
    null,
  );
  assert.equal(
    getHowToSchema(makePost(), PAGE_URL, "", SAFE_DESCRIPTION),
    null,
  );
});

test("extracts step body from <ul>/<ol>/<blockquote> when no <p> follows the heading", () => {
  // Authors often put a list or callout directly after a step heading
  // instead of a paragraph; without the fallback the step would be
  // silently dropped (Amaan's review on #383). Pin each tag.
  const schema = getHowToSchema(
    makePost({
      content: `
        <h2>Install dependencies</h2>
        <ul><li>Run npm install</li><li>Verify versions</li></ul>
        <h2>Configure environment</h2>
        <ol><li>Copy .env.example</li><li>Set DATABASE_URL</li></ol>
        <h2>Smoke test</h2>
        <blockquote>Hit the /health endpoint and expect 200.</blockquote>
      `,
    }),
    PAGE_URL,
    SAFE_TITLE,
    SAFE_DESCRIPTION,
  );
  assert.ok(schema, "expected schema even with no <p> bodies");
  const steps = schema!.step as Array<Record<string, unknown>>;
  assert.equal(steps.length, 3);
  // List items must be joined with a separator — not concatenated into a
  // run-on token like "Run npm installVerify versions" (Copilot review on
  // #383). Pin the ". " separator on both <ul> and <ol> bodies.
  assert.equal(steps[0].text, "Run npm install. Verify versions");
  assert.equal(steps[1].text, "Copy .env.example. Set DATABASE_URL");
  assert.match(steps[2].text as string, /\/health endpoint/);
});

test("truncates long step name/text at a word boundary, not mid-word", () => {
  const longHeading =
    "Configure the production-grade observability stack with Prometheus Grafana Loki Tempo Pyroscope and OpenTelemetry collectors end to end";
  const longBody = "lorem ipsum ".repeat(60); // > 480 chars, with spaces
  const schema = getHowToSchema(
    makePost({
      content: `<h2>${longHeading}</h2><p>${longBody}</p><h2>Second step</h2><p>OK.</p>`,
    }),
    PAGE_URL,
    SAFE_TITLE,
    SAFE_DESCRIPTION,
  );
  assert.ok(schema);
  const steps = schema!.step as Array<Record<string, unknown>>;
  const name = steps[0].name as string;
  const text = steps[0].text as string;
  // Both are truncated (...) and end on whitespace+ellipsis, not mid-word.
  assert.ok(name.endsWith("..."), `name should end with ellipsis: ${name}`);
  assert.ok(text.endsWith("..."), `text should end with ellipsis: ${text}`);
  // The full result (text + ellipsis) must stay within the documented caps
  // (110 for name, 480 for text) — the ellipsis must not push it over.
  assert.ok(name.length <= 110, `name length ${name.length} exceeds 110`);
  assert.ok(text.length <= 480, `text length ${text.length} exceeds 480`);
  // The character before the "..." must not split a token — i.e. it must
  // either be the end of a complete word from the source.
  const namePrefix = name.slice(0, -3);
  const textPrefix = text.slice(0, -3);
  assert.ok(
    longHeading.startsWith(namePrefix),
    "truncated name must be a prefix of the original",
  );
  assert.ok(
    longBody.trim().startsWith(textPrefix),
    "truncated text must be a prefix of the original",
  );
  // And specifically, the next char in the source past the cut must be
  // whitespace (proves we cut at a boundary, not mid-word).
  assert.equal(
    longHeading[namePrefix.length],
    " ",
    "name cut should land on a space",
  );
});

test("featuredImage is emitted as an ImageObject, not a bare URL string", () => {
  const schema = getHowToSchema(
    makePost({
      featuredImage: { node: { sourceUrl: "https://cdn.keploy.io/cover.png" } },
    }),
    PAGE_URL,
    SAFE_TITLE,
    SAFE_DESCRIPTION,
  );
  assert.ok(schema);
  const image = schema!.image as Array<Record<string, unknown>>;
  assert.equal(Array.isArray(image), true);
  assert.equal(image.length, 1);
  assert.equal(image[0]["@type"], "ImageObject");
  assert.equal(image[0].url, "https://cdn.keploy.io/cover.png");
});
