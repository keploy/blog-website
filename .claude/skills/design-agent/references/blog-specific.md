# Blog-Specific Overrides

This file contains only what is unique to `keploy/blog-website` beyond the
shared Keploy commons.

## Stack and content model

- [inferred] This repo is a Next.js Pages Router blog frontend with CMS-backed
  content.
  Evidence: `pages/*`, `next.config.js`, `package.json`.
- [explicit] The README documents WordPress + WPGraphQL as the content source.
  Evidence: `README.md`.
- [explicit] The app expects `WORDPRESS_API_URL` and fetches posts over GraphQL.
  Evidence: `README.md`, `lib/api.ts`.
- [inferred] Design review in this repo must account for CMS-authored HTML
  entering the UI, especially in article bodies and author metadata.
  Evidence: `components/post-body.tsx`, `pages/technology/[slug].tsx`,
  `pages/community/[slug].tsx`.

## Blog-specific tokens and repeated values

- [explicit] The repo adds a blog-specific Baloo 2 heading utility via
  `.heading1` and `.body`.
  Evidence: `styles/index.css`.
- [explicit] The repo defines a custom article typography system in
  `components/post-body.module.css`, including:
  article body clamp `0.9375rem -> 1.25rem`, `h1 2.25rem`, `h2 1.875rem`,
  `h3 1.5rem`, `h4 1.25rem`, `h5 1.125rem`, `h6 1rem italic`.
  Evidence: `components/post-body.module.css`.
- [explicit] The repo defines a global radius token `--radius: 0.5rem` mapped
  into Tailwind `borderRadius.lg/md/sm`.
  Evidence: `styles/index.css`, `tailwind.config.js`.
- [inferred] On blog surfaces, several repeated hardcoded values behave like
  de facto local tokens and should not be randomly changed in PRs:
  `#1D2022`, `#637277`, `#1e1e2e`, `#313244`, `#cdd6f4`, `#737373`, `#FFF4EE`.
  Evidence: `components/post-card.tsx`, `components/BlogSidebar.tsx`,
  `components/post-body.tsx`, `components/post-body.module.css`,
  `components/navbar/*`.
- [inferred] The orange underline/highlight pattern is blog-specific and heavily
  reused for section headings and links:
  `bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px]`.
  Evidence: `pages/tag/index.tsx`, `components/topBlogs.tsx`,
  `components/testimonials.tsx`, `components/TagsStories.tsx`,
  `components/NotFoundPage.tsx`.

## Typography overrides

- [explicit] `pages/_document.tsx` preloads both Baloo 2 and DM Sans.
  Evidence: `pages/_document.tsx`.
- [inferred] This repo uses a stricter role split than the shared commons:
  Baloo 2 is mainly for branded marketing/listing headings, while DM Sans is
  used for article title, body, TOC, author cards, and metadata.
  Evidence: `styles/index.css`, `components/post-title.tsx`,
  `components/post-body.module.css`, `components/AuthorCard.tsx`,
  `components/TableContents.tsx`.
- [inferred] New blog PRs should avoid introducing another typography mode on
  article surfaces, because this repo already mixes Baloo 2, DM Sans, Inter,
  and Arial in legacy pockets.
  Evidence: `styles/index.css`, `components/json-diff-viewer.module.css`.

## Layout overrides

- [inferred] Standard page shell is `Container`:
  `max-w-7xl mx-auto px-5 sm:px-6`.
  Evidence: `components/container.tsx`.
- [inferred] Article pages use a repo-specific centered content column at
  `max-w-[780px]`.
  Evidence: `components/post-header.tsx`, `components/post-body.tsx`,
  `components/TableContents.tsx`.
- [inferred] Article pages switch to a 3-column layout only at `min-[1440px]`,
  with TOC left, content center, and sidebar right.
  Evidence: `components/post-body.tsx`.
- [inferred] `ContainerSlug` is the wide article shell for gutters around the
  780px content column.
  Evidence: `components/containerSlug.tsx`.
- [inferred] Standard blog feed grids should use `PostGrid`:
  `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`.
  Evidence: `components/post-grid.tsx`.
- [inferred] The search input shell is repeated enough to be treated as a local
  pattern:
  `w-full p-4 pl-10 rounded-full border border-gray-300`.
  Evidence: `components/more-stories.tsx`, `pages/tag/index.tsx`,
  `components/NotFoundPage.tsx`.

## Blog-specific component usage

- [inferred] Use `PostCard` for standard blog post cards across home, category,
  tag, author, and 404 surfaces.
  Evidence: `components/topBlogs.tsx`, `components/more-stories.tsx`,
  `components/TagsStories.tsx`, `components/NotFoundPage.tsx`,
  `components/postByAuthorMapping.tsx`.
- [inferred] Use `PostGrid` for standard multi-post layouts instead of
  rebuilding column grids per page.
  Evidence: `components/topBlogs.tsx`, `components/more-stories.tsx`,
  `components/TagsStories.tsx`, `components/NotFoundPage.tsx`.
- [inferred] Use `HeroPost` for the first featured item on technology/community
  landing pages.
  Evidence: `pages/technology/index.tsx`, `pages/community/index.tsx`.
- [inferred] Use `MoreStories` for paginated/searchable blog feeds.
  Evidence: `pages/technology/index.tsx`, `pages/community/index.tsx`,
  `pages/technology/[slug].tsx`, `pages/community/[slug].tsx`.
- [inferred] Article pages should compose `PostHeader` + `PostBody` rather than
  manually rebuilding article layouts.
  Evidence: `pages/technology/[slug].tsx`, `pages/community/[slug].tsx`.
- [inferred] `FloatingNavbar` / `FloatingNavbarClient` are the active blog nav
  implementation; `MainNav` and `MobileNav` are secondary/legacy patterns.
  Evidence: `components/header.tsx`, `components/navbar/*`.
- [inferred] `PostPreview`, `TagsPostPreview`, `ReviewingAuthor`, and
  `author-description.jsx` are legacy patterns and should not be copied into new
  work without a strong reason.
  Evidence: duplicate functionality compared with `PostCard` / `AuthorCard`.

## Accessibility overrides

- [inferred] This repo relies on explicit labels for nav/search/share/tag/blog
  actions more than some Keploy repos, so missing or changed labels are a real
  regression risk.
  Evidence: `components/navbar/FloatingNavbarClient.tsx`,
  `components/BlogSidebar.tsx`, `components/tag.tsx`,
  `components/ScrollToTop.tsx`, tests under `tests/responsive` and
  `tests/components`.
- [explicit] Responsive tests assert specific accessibility hooks such as
  `aria-label="Open menu"`, `aria-label="Close menu"`,
  `aria-label="Open search"`, and search dialog labeling.
  Evidence: `tests/responsive/MobileNavigation.spec.ts`.
- [inferred] The article TOC depends on `aria-expanded` and keyboard disclosure
  patterns; PRs that replace these with non-semantic click handlers should be
  flagged.
  Evidence: `components/TableContents.tsx`, `components/ui/collapsible.tsx`.

## Anti-patterns already present in this repo

- [inferred] Article/listing UI frequently uses inline style objects for color,
  font family, font size, and spacing instead of shared classes or components.
  Evidence: `components/post-card.tsx`, `components/AuthorCard.tsx`,
  `components/AuthorHero.tsx`, `components/BlogSidebar.tsx`,
  `components/post-title.tsx`.
- [inferred] The repo has multiple overlapping blog-card implementations:
  `PostCard`, `PostPreview`, `TagsPostPreview`, `HeroPost`, `LatestPost`.
  New PRs should not add another near-duplicate card type.
  Evidence: `components/*post*.tsx`.
- [inferred] The same pill search input is duplicated in several files instead
  of being formalized as a shared component.
  Evidence: `components/more-stories.tsx`, `pages/tag/index.tsx`,
  `components/NotFoundPage.tsx`.
- [inferred] Arbitrary values are common in navbar and hero styling:
  arbitrary shadows, radii, gradient borders, and custom breakpoints.
  New PRs should avoid increasing that drift unless extending an existing local
  pattern in the same component family.
  Evidence: `components/navbar/main-nav.tsx`,
  `components/navbar/FloatingNavbarClient.tsx`,
  `components/hero-post.tsx`, `components/NotFoundPage.tsx`.
- [inferred] Nested interactive elements already exist, especially
  `Link`-wrapped buttons on tag surfaces, and should be flagged rather than
  copied.
  Evidence: `components/tag.tsx`, `pages/tag/index.tsx`.
- [inferred] Focus treatment is inconsistent on legacy blog surfaces, with
  custom blue rings in some search inputs and tokenized `focus-visible` rings in
  `components/ui/*`. New blog work should not add another focus style variant.
  Evidence: `more-stories.tsx`, `tag/index.tsx`, `NotFoundPage.tsx`,
  `components/ui/button.tsx`, `components/ui/sheet.tsx`.

## CMS and content constraints

- [explicit] Content is authored in WordPress and rendered via WPGraphQL.
  Evidence: `README.md`, `lib/api.ts`.
- [inferred] Article content is HTML from the CMS and is post-processed in the
  client to remove WordPress TOC widgets, author boxes, heading inline styles,
  and some author URLs.
  Evidence: `components/post-body.tsx`, `pages/technology/[slug].tsx`,
  `pages/community/[slug].tsx`.
- [inferred] Blog article headings are generated from CMS content and turned
  into anchor targets and TOC items at runtime, so PRs should not break heading
  semantics in CMS-rendered content.
  Evidence: `components/post-body.tsx`, `components/TableContents.tsx`.
- [inferred] Search and excerpt behavior on listing pages depends on stripping
  `"Table of Contents"` from CMS excerpts.
  Evidence: `PostCard`, `PostPreview`, `HeroPost`, `LatestPost`,
  `TagsPostPreview`.
- [inferred] Author info is partially scraped or extracted from CMS-authored
  content, so author-card changes should account for malformed or missing avatar
  and description data.
  Evidence: `pages/technology/[slug].tsx`, `pages/community/[slug].tsx`,
  `utils/extractAuthorData.ts`, `AuthorCard.tsx`.
