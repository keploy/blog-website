/**
 * Unit tests for safeJsonLdStringify (utils/seo.ts).
 *
 * Pin the script-injection safety guarantees so a future change to the
 * escape list can't quietly re-open the </script> termination hole.
 * Specifically: now that `sanitizeTitle` / `getSafeDescription` decode
 * `&lt;`/`&gt;` for the meta/title attribute path, those raw `<`/`>` can
 * legitimately flow into JSON-LD field values on post pages — so the
 * safety guarantee MUST live at the JSON-LD serialization boundary.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { safeJsonLdStringify } from "../../utils/seo";

test("escapes < and > so a value can't terminate the enclosing <script>", () => {
  const payload = { headline: "Use </script><img src=x onerror=alert(1)>" };
  const out = safeJsonLdStringify(payload);
  // No literal </script> anywhere in the serialized string — the unicode
  // escapes round-trip back to the original chars when JSON.parse runs.
  assert.doesNotMatch(out, /<\/script>/i);
  assert.doesNotMatch(out, /<img/i);
  assert.match(out, /\\u003c\\u002fscript\\u003e|\\u003c\/script\\u003e/);
  // And the value still parses back to the original characters (so
  // schema consumers see the intended string, just safely encoded in
  // the script body).
  assert.equal(
    (JSON.parse(out) as { headline: string }).headline,
    payload.headline,
  );
});

test("escapes & so script-context values can't introduce HTML entities", () => {
  const out = safeJsonLdStringify({ a: "Tom & Jerry" });
  assert.doesNotMatch(out, /Tom & Jerry/);
  assert.match(out, /Tom \\u0026 Jerry/);
  assert.equal((JSON.parse(out) as { a: string }).a, "Tom & Jerry");
});

test("escapes U+2028 / U+2029 so JS parsers don't break on line separators", () => {
  const out = safeJsonLdStringify({ a: "line1\u2028line2\u2029line3" });
  assert.doesNotMatch(out, /[\u2028\u2029]/);
  assert.match(out, /line1\\u2028line2\\u2029line3/);
  assert.equal(
    (JSON.parse(out) as { a: string }).a,
    "line1\u2028line2\u2029line3",
  );
});

test("leaves normal JSON characters intact (round-trips)", () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Sample tutorial",
    step: [
      { "@type": "HowToStep", position: 1, name: "First", text: "Do this." },
      { "@type": "HowToStep", position: 2, name: "Second", text: "Then that." },
    ],
  };
  const out = safeJsonLdStringify(schema);
  assert.deepEqual(JSON.parse(out), schema);
});
