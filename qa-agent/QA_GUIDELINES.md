# QA Guidelines
> Generated from codebase analysis on 2026-04-13
> These rules are derived from actual patterns in this codebase.
> Update this file when the codebase conventions change — via PR, reviewed by the team.

---

## Section 1 — Architecture rules

### RULE-A-001: Respect the `/blog` basePath everywhere
**What**: Any hardcoded internal path to site assets or routes must include the `/blog` prefix (because `next.config.js` sets `basePath: '/blog'` and `assetPrefix: '/blog'`).  
**Why**: Missing the prefix breaks favicons, RSS link, and other assets in production, and can break Playwright tests (which use `BASE_URL=http://localhost:3000/blog`).  
**How to check**: In diffs, search for new `href="/` or `src="/` in React components and ensure it’s `"/blog/..."`
**Example of violation**:
```tsx
// components/meta.tsx style, but missing basePath:
<link rel="icon" href="/favicon/favicon.ico" />
```
**Example of compliance**:
```tsx
// components/meta.tsx
<link rel="shortcut icon" href="/blog/favicon/favicon.ico" />
```

### RULE-A-002: Routes live in the Pages Router (`pages/`), not `app/`
**What**: New routes must be added under `pages/` using the existing patterns (e.g. `pages/technology/index.tsx`, `pages/technology/[slug].tsx`, `pages/api/*.ts`).  
**Why**: The repo currently uses Next.js Pages Router conventions and Playwright tests navigate to `.../blog/technology`, `.../blog/community`, etc. Introducing App Router patterns without a migration plan can break routing and test assumptions.  
**How to check**: New route files should be under `pages/` and follow existing naming (`index.tsx`, `[slug].tsx`).  
**Example of violation**:
```txt
app/technology/page.tsx
```
**Example of compliance**:
```txt
pages/technology/index.tsx
pages/technology/[slug].tsx
```

### RULE-A-003: WordPress/WPGraphQL access must go through `lib/api.ts`
**What**: Fetching posts/tags/authors/content from WordPress should use exported functions in `lib/api.ts` (`getAllPostsForTechnology`, `getPostAndMorePosts`, `getAllTags`, etc.) rather than ad-hoc `fetch()` scattered across pages/components.  
**Why**: `lib/api.ts` centralizes headers, auth token handling (`WORDPRESS_AUTH_REFRESH_TOKEN`), error handling (throws on GraphQL errors), and response normalization (`normalizePostEdges`) to avoid null runtime crashes in downstream consumers.  
**How to check**: New diffs should not add direct `fetch(process.env.WORDPRESS_API_URL...)` calls in page components; instead add/extend a function in `lib/api.ts` and reuse it.  
**Example of violation**:
```ts
// pages/technology/index.tsx (hypothetical)
await fetch(process.env.WORDPRESS_API_URL!, { method: "POST", body: ... })
```
**Example of compliance**:
```ts
// pages/technology/index.tsx
const allPosts = await getAllPostsForTechnology(preview);
```

### RULE-A-004: Heavy UI is dynamically imported with `ssr: false`
**What**: Large client-only components are imported via `next/dynamic` with `ssr: false` (e.g. `components/post-body.tsx` in `pages/*/[slug].tsx`, `components/PageLoader.tsx` in `pages/_app.tsx`).  
**Why**: This repo explicitly uses dynamic imports to keep initial JS smaller and to avoid SSR mismatches for DOM-dependent code (TOC building, CodeMirror, portals).  
**How to check**: If a new component reads `window`, uses CodeMirror, portals, IntersectionObserver, etc., it should follow the dynamic import pattern used for `PostBody`.  
**Example of violation**:
```tsx
import PostBody from "../../components/post-body"; // SSR will execute DOM code
```
**Example of compliance**:
```tsx
const PostBody = dynamic(() => import("../../components/post-body"), { ssr: false });
```

### RULE-A-005: SEO structured data comes from `lib/structured-data.ts`
**What**: JSON-LD schemas must be produced via helpers in `lib/structured-data.ts`, and injected via `Meta`/`_document.tsx` as the codebase currently does.  
**Why**: `tests/e2e/SeoMeta.spec.ts` asserts meta tags, canonical/og URLs, and presence of schema.org JSON-LD. Duplicate or conflicting JSON-LD can regress SEO tests and search parsing.  
**How to check**: When adding structured data, prefer `getBreadcrumbListSchema`, `getBlogPostingSchema`, `getWebSiteSchema`; avoid inlining hand-written JSON-LD blocks in pages.  
**Example of violation**:
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{__html: '{\"@type\":\"BreadcrumbList\"...}'}} />
```
**Example of compliance**:
```tsx
structuredData={[getBreadcrumbListSchema([{ name: "Home", url: SITE_URL }])]}
```

---

## Section 2 — Type safety rules

### RULE-T-001: Shared shapes must be modeled via `types/` interfaces
**What**: When changing or introducing shared post/author/tag data, update `types/post.ts`, `types/author.ts`, `types/tag.ts` and wire the types through component props.  
**Why**: Many components type their props off `Post` (e.g. `Layout` and `Meta` use `Post["featuredImage"]["node"]["sourceUrl"]`). Unmodeled shape changes can cause subtle runtime breakage that TypeScript won’t catch (tsconfig `strict: false`).  
**How to check**: If a PR changes the GraphQL selection set or adds fields used by multiple files, ensure `types/` reflects it and usage sites compile logically.  
**Example of violation**:
```ts
// Adding new field usage without updating Post:
post.seo.metaDesc
```
**Example of compliance**:
```ts
// types/post.ts updated + code uses typed access
export interface Post { seo?: { metaDesc?: string } }
```

### RULE-T-002: URL fragments and slugs must use the existing sanitizers
**What**: Any URL slug/anchor derived from arbitrary text must go through existing utilities:
- `utils/sanitizeStringForUrl.ts` (`sanitizeStringForURL`)
- `utils/sanitizeAuthorSlug.ts` (`sanitizeAuthorSlug`)
**Why**: The TOC system depends on stable heading IDs; author pages depend on stable slug normalization. Changing the algorithm or bypassing it can break deep links and internal navigation.  
**How to check**: If a PR introduces `id={heading.textContent}` or similar, require `sanitizeStringForURL(...)`.  
**Example of violation**:
```ts
heading.setAttribute("id", heading.textContent || "");
```
**Example of compliance**:
```ts
heading.setAttribute("id", sanitizeStringForURL(heading.textContent || "", true));
```

---

## Section 3 — Error handling rules

### RULE-E-001: Network/GraphQL failures in `getStaticProps` must degrade gracefully
**What**: When a page fetches WordPress data at build/ISR time, it must protect against API failures (use `try/catch` and return safe empty props + reasonable `revalidate`).  
**Why**: This repo already guards critical pages (e.g. `pages/technology/index.tsx` returns `emptyData` on error, `pages/community/[slug].tsx` returns `notFound` on errors). Unhandled fetch errors can fail builds or cause ISR crashes.  
**How to check**: New `getStaticProps` and `getStaticPaths` code should not allow unhandled exceptions to bubble out.  
**Example of violation**:
```ts
export const getStaticProps = async () => {
  const allPosts = await getAllPostsForTechnology(false); // no try/catch
  return { props: { allPosts } };
};
```
**Example of compliance**:
```ts
try {
  const allPosts = await getAllPostsForTechnology(preview);
  return { props: { allPosts }, revalidate: 10 };
} catch (error) {
  return { props: { allPosts: emptyData }, revalidate: 60 };
}
```

### RULE-E-002: Public proxy endpoints must keep explicit allowlists
**What**: If modifying `pages/api/proxy-image.ts`, keep:
- `https:` only
- hostname allowlist
**Why**: This route proxies arbitrary URLs. Relaxing validation can create SSRF/open-proxy risks and cache poisoning.  
**How to check**: Ensure `ALLOWED_HOSTNAMES` remains restrictive and protocol remains `https:`.  
**Example of violation**:
```ts
// Accept http and any host
if (!targetUrl.hostname) return;
```
**Example of compliance**:
```ts
if (targetUrl.protocol !== "https:") return res.status(400).send("Only https protocol is allowed");
if (!ALLOWED_HOSTNAMES.has(targetUrl.hostname)) return res.status(403).send("Host not allowed");
```

---

## Section 4 — API and data layer rules

### RULE-D-001: Category slug pages must enforce canonical category routing
**What**: When rendering `pages/community/[slug].tsx` and `pages/technology/[slug].tsx`, the page must validate the fetched post belongs to the intended category and redirect to the correct category otherwise.  
**Why**: This repo explicitly prevents duplicate content (same post accessible under both `/community/slug` and `/technology/slug`). Breaking this can harm SEO and can invalidate canonical/og:url assumptions.  
**How to check**: If editing these slug pages, preserve the “validate category + redirect” logic.  
**Example of violation**:
```ts
// Removing category validation means duplicate URLs can exist.
return { props: { post: data.post }, revalidate: 60 };
```
**Example of compliance**:
```ts
const postCategories = data.post?.categories?.edges?.map((e) => e.node.name.toLowerCase()) || [];
if (!postCategories.includes("technology")) return { redirect: { destination: `/community/${data.post.slug}`, permanent: true } };
```

### RULE-D-002: Slug redirects use `config/redirect.ts`
**What**: If adding redirects for stale slugs, add mappings to `config/redirect.ts` and use `getRedirectSlug()` in slug pages (as already done).  
**Why**: Central mapping avoids scattered redirect logic and keeps redirect behavior consistent across categories and Vercel/Next redirect layers.  
**How to check**: New redirect mappings should appear in `config/redirect.ts`, not hardcoded inside page files.  
**Example of violation**:
```ts
if (slug === "old-slug") return { redirect: { destination: "/community/new-slug", permanent: true } };
```
**Example of compliance**:
```ts
const redirectSlug = getRedirectSlug(slug);
if (redirectSlug) return { redirect: { destination: `/community/${redirectSlug}`, permanent: true } };
```

---

## Section 5 — Testing rules

This codebase uses Playwright E2E tests (`@playwright/test`) in `tests/`, with a local mock GraphQL server (`tests/mock-server.js`) started via `playwright.config.ts:webServer`.

### RULE-S-001: UI changes must preserve `data-testid` used by tests
**What**: If a PR changes markup in tested components, it must preserve or update the `data-testid` contract (examples: `data-testid="post-grid"`, `post-card`, `hero-post-title`, `post-content`, `toc-nav`, `scroll-to-top`, `site-footer`).  
**Why**: This repo’s tests heavily rely on these attributes for stable selectors across responsive breakpoints.  
**How to check**: Search in `tests/**/*.spec.ts` for any `getByTestId(...)` value touched by the diff.  
**Example of violation**:
```tsx
// Removing this breaks multiple specs:
<footer data-testid="site-footer">...</footer>
```
**Example of compliance**:
```tsx
<footer data-testid="site-footer" className="...">...</footer>
```

### RULE-S-002: Playwright assumes the app runs under `/blog`
**What**: Do not change Playwright’s base URL semantics without updating tests:
- `playwright.config.ts` defaults `BASE_URL=http://localhost:3000/blog`
- `.env.test.example` documents the same
**Why**: Routes and assets are basePath’d; tests navigate to `/technology`, `/community` relative to `/blog`.  
**How to check**: If touching `next.config.js` basePath, or `playwright.config.ts`, ensure tests and env examples are updated in the same PR.  
**Example of violation**:
```ts
const BASE_URL = 'http://localhost:3000'; // breaks all test navigations
```
**Example of compliance**:
```ts
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/blog';
```

**Minimum test requirements for a PR to pass**:
- [ ] If SEO/meta behavior changes: update `tests/e2e/SeoMeta.spec.ts`
- [ ] If navigation/search changes: update `tests/components/Navigation.spec.ts` and/or `tests/responsive/MobileNavigation.spec.ts`
- [ ] If post rendering/TOC changes: update `tests/components/PostBody.spec.ts` and/or `tests/components/TableContents.spec.ts`
- [ ] If footer changes: update `tests/components/Footer.spec.ts`

---

## Section 6 — Naming and style rules

### RULE-N-001: Tailwind class merging uses `cn(...)` helper
**What**: When conditionally composing Tailwind classes, use `cn` from `lib/utils/utils.ts` (clsx + tailwind-merge).  
**Why**: This repo already has a canonical class merging helper used in `components/header.tsx` and nav components.  
**How to check**: If a PR adds conditional `className`, prefer `cn(...)` over manual string concatenation when it improves readability.  
**Example of violation**:
```tsx
className={isActive ? "text-orange-500 " + base : base}
```
**Example of compliance**:
```tsx
className={cn(base, isActive && "text-orange-500")}
```

---

## Section 7 — Dependency rules

### RULE-P-001: Avoid adding redundant libraries that duplicate existing deps
**What**: Before adding a dependency, check existing equivalents already used in this repo:
- Classnames: `clsx` + `tailwind-merge` via `lib/utils/utils.ts:cn`
- Icons: `lucide-react` and `react-icons` already used
- E2E tests: `@playwright/test` is the established runner
**Why**: This repo already has overlapping utilities (`classnames` + `clsx` exist) and a large UI surface; extra deps increase bundle/tooling complexity.  
**How to check**: If adding deps to `package.json`, the PR description must justify why existing deps are insufficient.  
**Example of violation**:
```json
{ "dependencies": { "another-classnames-lib": "^1.0.0" } }
```
**Example of compliance**:
```ts
import { cn } from "@/lib/utils/utils";
```

---

## Section 8 — Breaking change detection rules

### RULE-B-001: `lib/api.ts` interface stability (WPGraphQL data layer)
**What this module provides**: All WordPress/WPGraphQL reads for posts/tags/authors/content; central `fetchAPI` with auth header support and error throwing; response normalization.  
**Files that depend on it**:
- `pages/index.tsx`
- `pages/community/index.tsx`
- `pages/technology/index.tsx`
- `pages/community/[slug].tsx`
- `pages/technology/[slug].tsx`
- `pages/search.tsx`
- `pages/community/search.tsx`
- `pages/tag/index.tsx`
- `pages/tag/[slug].tsx`
- `pages/authors/index.tsx`
- `pages/authors/[slug].tsx`
- `pages/404.tsx`
- `pages/api/nav-latest.ts`
- `pages/api/search-all.ts`
- `pages/api/preview.ts`
- `components/more-stories.tsx`
**What a change here can break**:
- Build/ISR crashes if errors stop being thrown/caught or if functions start returning different shapes
- Runtime null crashes if `normalizePostEdges` is removed/changed
- Tests relying on mock-server’s query routing (it matches query names/strings)
**What to check when this file is modified**:
- [ ] GraphQL selection sets still include fields that UI expects (title, excerpt, slug, date, featuredImage, categories, etc.)
- [ ] Any renamed query strings still match `tests/mock-server.js` routing rules
- [ ] Call sites in the dependent files still compile and logically handle `pageInfo` / `edges` changes

### RULE-B-002: `types/post.ts` interface stability (shared UI contract)
**What this module provides**: The canonical `Post` shape used across components and pages.  
**Files that depend on it**: Multiple components (`Layout`, `Meta`, `PostCard`, `HeroPost`, `PostBody`, etc.) and search pages.  
**What a change here can break**:
- Type-level drift that hides runtime shape mismatches (tsconfig `strict: false`)
- Wide downstream refactors due to indexed-access typing (e.g. `Post["featuredImage"]["node"]["sourceUrl"]`)
**What to check when this file is modified**:
- [ ] Update any components that use indexed-access types from `Post`
- [ ] Confirm GraphQL functions in `lib/api.ts` still fetch the fields required by the type

### RULE-B-003: `lib/structured-data.ts` stability (SEO + tests)
**What this module provides**: `SITE_URL` and schema builders for JSON-LD structured data used by pages and `_document.tsx`.  
**Files that depend on it**: Most top-level pages and both `[slug]` pages.  
**What a change here can break**:
- `tests/e2e/SeoMeta.spec.ts` assertions for JSON-LD validity and canonical/og URL formats
- SEO regressions if `SITE_URL` changes unexpectedly
**What to check when this file is modified**:
- [ ] `SITE_URL` remains consistent with production basePath (`https://keploy.io/blog`)
- [ ] Pages that set `canonicalUrl` still align with the updated scheme
- [ ] Update `tests/e2e/SeoMeta.spec.ts` if output changes are intended

### RULE-B-004: `utils/sanitizeStringForUrl.ts` stability (anchors + slugs)
**What this module provides**: `sanitizeStringForURL`, used to generate heading anchors and author slugs.  
**Files that depend on it**:
- `components/post-body.tsx` (heading IDs)
- `components/TableContents.tsx` (lookup + scroll)
- `utils/sanitizeAuthorSlug.ts`
**What a change here can break**:
- Deep links (`#heading`) no longer matching, TOC scrolling/active tracking failures
- Author page URLs no longer matching previously indexed links
**What to check when this file is modified**:
- [ ] Heading IDs are still deterministic and URL-safe
- [ ] Existing hyphen/character normalization semantics remain compatible

### RULE-B-005: `next.config.js` stability (basePath, env exposure, CSP)
**What this module provides**: `basePath`/`assetPrefix` (`/blog`), CSP headers, redirects, and exposing `NEXT_PUBLIC_WORDPRESS_API_URL`.  
**What a change here can break**:
- All internal links and asset URLs
- Next build failing early due to missing/invalid `WORDPRESS_API_URL` (`URL.canParse` guard)
- Production CSP violations if connect-src/frame-src/img-src gets too strict
**What to check when this file is modified**:
- [ ] Any new env vars are added to `.env.local.example` and `.env.test.example` (if relevant)
- [ ] Playwright baseURL and tests still match the deployed basePath

### RULE-B-006: `components/container.tsx` layout contract (global page width)
**What this module provides**: The standard page wrapper (`max-w-7xl mx-auto ...`) used by most pages.  
**Files that depend on it**: Many Pages Router pages and components (top 10 by coupling in `codebase_map.json`).  
**What a change here can break**:
- Widespread layout regressions and responsive test failures (e.g. `tests/responsive/MobileLayout.spec.ts`)
**What to check when this file is modified**:
- [ ] Mobile/tablet tests still pass the “no horizontal overflow” assertions
- [ ] Page-level spacing (notably `main` padding in `components/layout.tsx`) still composes correctly

### RULE-B-007: `components/layout.tsx` app-shell stability (meta + scripts + footer)
**What this module provides**: Global app shell: `Meta`, page fade-in wrapper, footer, scroll-to-top, and analytics scripts.  
**Files that depend on it**: Most `pages/*.tsx` use `Layout` directly.  
**What a change here can break**:
- SEO meta expectations (via `Meta`)
- Footer presence (`tests/components/Footer.spec.ts`)
- Scroll-to-top (`tests/components/ScrollToTop.spec.ts`)
**What to check when this file is modified**:
- [ ] Any meta-related behavior changes are reflected in `components/meta.tsx` and `tests/e2e/SeoMeta.spec.ts`
- [ ] Footer and scroll-to-top still render on pages where tests expect them

### RULE-B-008: `components/header.tsx` + navbar stability (navigation + reading progress)
**What this module provides**: Fixed header and reading-progress bar on slug pages (`/technology/[slug]`, `/community/[slug]`).  
**Files that depend on it**: Most pages render `Header`; slug pages pass `readProgress`.  
**What a change here can break**:
- Navigation visibility / selectors (`tests/components/Navigation.spec.ts`, `tests/responsive/MobileNavigation.spec.ts`)
- Reading progress bar behavior on article pages
**What to check when this file is modified**:
- [ ] `data-testid="navbar"` still exists (comes from `components/navbar/FloatingNavbar.tsx`)
- [ ] Slug routes still detect reading pages correctly (`router.pathname` checks)

### RULE-B-009: `lib/constants.ts` stability (SEO images and branding constants)
**What this module provides**: `HOME_OG_IMAGE_URL` and other constants used across pages/components.  
**Files that depend on it**: `pages/index.tsx`, `components/meta.tsx`, tag/authors pages, etc.  
**What a change here can break**:
- OG image fallbacks and SEO tests that expect a truthy `og:image` (`tests/e2e/SeoMeta.spec.ts`)
**What to check when this file is modified**:
- [ ] `HOME_OG_IMAGE_URL` remains a valid image URL or tests are updated accordingly

### RULE-B-010: `lib/utils/utils.ts` (`cn`) stability (Tailwind class merging)
**What this module provides**: `cn(...inputs)` wrapper around `clsx` + `tailwind-merge`.  
**Files that depend on it**: Header and navigation components, plus other UI pieces.  
**What a change here can break**:
- Class merging regressions that are hard to spot, especially across responsive breakpoints
**What to check when this file is modified**:
- [ ] `cn` still accepts a variadic set of inputs and returns a string
- [ ] No behavioral changes without updating dependent components

### RULE-B-011: `utils/excerpt.ts` stability (feed/search display behavior)
**What this module provides**: `getExcerpt(content, maxWords)` used in feeds and cards to prevent overlong previews.  
**Files that depend on it**: `components/more-stories.tsx`, `components/topBlogs.tsx`, listing pages.  
**What a change here can break**:
- Card layout and test expectations for excerpt presence/length (`tests/components/HeroPost.spec.ts`)
**What to check when this file is modified**:
- [ ] `getExcerpt` still returns a string (never `null`)
- [ ] Word counting remains consistent (split-by-space behavior)

### RULE-B-012: `components/post-body.tsx` stability (TOC + code blocks + author cards)
**What this module provides**: Article rendering: TOC generation, heading IDs, code block rendering (CodeMirror), and author cards.  
**Files that depend on it**:
- `pages/technology/[slug].tsx`
- `pages/community/[slug].tsx`
**What a change here can break**:
- TOC behavior and anchor scrolling (`tests/components/TableContents.spec.ts`)
- Code block rendering and copy button (`tests/components/PostBody.spec.ts`)
**What to check when this file is modified**:
- [ ] `data-testid` contracts used by tests still exist (`post-content`, `code-block`, `copy-button`, `mobile-toc`, `desktop-toc`)
- [ ] Heading ID generation still uses `sanitizeStringForURL` and stays deterministic

### RULE-B-013: `playwright.config.ts` + `tests/mock-server.js` stability (test harness)
**What this provides**: The E2E harness: base URL defaults to `/blog`, and a mock GraphQL server that routes by query strings.  
**What a change here can break**:
- CI E2E tests (`.github/workflows/playwright.yml`) and local `npm run test:e2e`
**What to check when this file is modified**:
- [ ] `BASE_URL` still defaults to `http://localhost:3000/blog`
- [ ] Mock server still serves the queries that `lib/api.ts` emits (query string matching in `handleGraphQL`)

---

## Section 9 — PR checklist

- [ ] PR has a description (use `.github/PULL_REQUEST_TEMPLATE.md` structure)
- [ ] PR description explains WHY not just WHAT
- [ ] No new `console.log(...)` added in non-test code (repo already has accidental logs like `pages/technology/index.tsx`)
- [ ] No new proxy/network endpoints added without validation/allowlists (see `pages/api/proxy-image.ts`)
- [ ] No new environment variables added without updating `.env.local.example` and `.env.test.example`
- [ ] Diff does not include lock file changes without `package.json` changes
- [ ] If `basePath`/`assetPrefix` changes: asset references and Playwright config/tests are updated
- [ ] If `lib/api.ts` changes: confirm affected pages and `tests/mock-server.js` query routing still work
- [ ] If `types/post.ts` changes: confirm all importing components still match runtime shapes
- [ ] New dependencies are justified in the PR description

---

## Section 10 — Severity levels

**CRITICAL** — must be fixed before merge. Breaks existing functionality, introduces security issue, or violates a rule with no safe exceptions.

**WARNING** — should be fixed, but merge is not blocked. Inconsistent with conventions, reduces quality, or introduces technical debt.

**INFO** — observation or suggestion. Improvement opportunity, not a violation.

**QUESTION** — the agent cannot determine if this is correct without human context. Flags for reviewer attention.
