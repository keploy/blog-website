/**
 * Unit tests for the server-safe PublishPress author-box parser.
 *
 * Run via: `npm run test:unit`
 *
 * These pin the extraction contract that feeds the author JSON-LD. The bio
 * regex previously stopped at the first closing tag of any kind, so a bio with
 * an inline <a> link was silently truncated on the author page while the post
 * pages captured it in full — two conflicting Person.description values for the
 * same @id. The link case below is the regression guard for that.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { extractAuthorBio, extractAuthorBox } from "../../lib/author-box";

const box = (bio: string) =>
  `<div class="pp-author-boxes-avatar"><img src="https://img/a.png"/></div>` +
  `<p class="pp-author-boxes-description">${bio}</p>` +
  `<a href="https://www.linkedin.com/in/jane">LinkedIn</a>`;

test("extractAuthorBio: plain bio", () => {
  assert.equal(
    extractAuthorBio(box("Staff engineer. Writes about API testing.")),
    "Staff engineer. Writes about API testing.",
  );
});

test("extractAuthorBio: bio with an inline link is not truncated at the first closing tag", () => {
  const html = box(
    'Staff engineer at <a href="https://keploy.io">Keploy</a>. Writes about API testing.',
  );
  // Captured through </p>, so the trailing sentence after the </a> survives.
  const bio = extractAuthorBio(html);
  assert.ok(bio?.includes("Writes about API testing."), `truncated: ${bio}`);
});

test("extractAuthorBio: missing author box -> undefined", () => {
  assert.equal(extractAuthorBio("<p>no author box here</p>"), undefined);
  assert.equal(extractAuthorBio(""), undefined);
  assert.equal(extractAuthorBio(undefined), undefined);
});

test("extractAuthorBio: empty/whitespace bio -> undefined", () => {
  assert.equal(
    extractAuthorBio('<p class="pp-author-boxes-description">   </p>'),
    undefined,
  );
});

test("extractAuthorBox: pulls avatar, linkedIn, and bio together", () => {
  const meta = extractAuthorBox(box("Bio text."));
  assert.equal(meta.avatarUrl, "https://img/a.png");
  assert.equal(meta.linkedIn, "https://www.linkedin.com/in/jane");
  assert.equal(meta.bio, "Bio text.");
});

test("extractAuthorBox: empty html -> empty object", () => {
  assert.deepEqual(extractAuthorBox(""), {});
  assert.deepEqual(extractAuthorBox(undefined), {});
});
