# Content Rules

This repo is a blog website. Even though most article content is fetched from WordPress instead of stored locally, review content quality through the rendering, metadata, and test surfaces in this repo.

1. All images must have non-empty, descriptive alt text.
   - Check React-rendered image usage and any CMS-derived image wrappers.

2. Links must use meaningful text.
   - Avoid vague text such as `click here`, `read more`, or unlabeled icon-only links without accessible names.

3. No duplicate page titles across major route templates unless intentional.
   - Review title generation in `components/meta.tsx`, `components/layout.tsx`, `utils/seo.ts`, and route pages.

4. No broken internal anchor links.
   - This is especially important for TOC and article heading navigation in `components/TableContents.tsx` and `components/post-body.tsx`.

5. Front matter rule equivalence:
   - For locally stored markdown, require `title` and `description`.
   - For this repo’s runtime blog pages, require the rendered equivalent through metadata props and structured data.

6. Thin-content warning:
   - If a page template or rendered post path produces an obviously stub-like experience, flag it as a warning.

7. Code examples should be complete enough to follow or run.
   - Flag obviously truncated snippets or stub-like ellipses in locally maintained docs or components.

8. Future-dated content should not ship without an explicit draft or preview guard.
   - This mostly applies to CMS-fed content assumptions and test fixtures in this repo.

9. For this blog site, SEO metadata is a content requirement:
   - `og:image`, `og:description`, and canonical URL are blocking on production pages.
   - JSON-LD should remain valid and aligned with visible content.
