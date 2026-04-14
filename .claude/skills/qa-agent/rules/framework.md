# Framework Rules

Project framework: Next.js Pages Router with TypeScript and a WordPress GraphQL backend.

Review against these repo-specific framework rules:

1. Pages Router only:
   - Do not introduce App Router-only conventions such as `app/`, `layout.tsx`, `page.tsx`, route segment config, or Server Actions into this repo.
   - Follow the existing `pages/` structure used by `pages/index.tsx`, `pages/community/[slug].tsx`, and `pages/technology/[slug].tsx`.

2. Metadata must flow through the shared metadata layer:
   - Route pages should continue to use `components/layout.tsx` and `components/meta.tsx` for canonical, OG, Twitter, and JSON-LD metadata.
   - Page-local `<Head>` usage is acceptable only for route-specific title overrides like `pages/index.tsx` and `pages/community/[slug].tsx`.
   - Blocking for blog pages: missing canonical URL, `og:image`, or `og:description`.

3. Internal navigation must use Next primitives:
   - Use `next/link` for internal navigation.
   - Use `next/image` for images rendered in React components.
   - New raw `<img>` tags in page or component code are a blocking issue unless there is a documented technical exception.

4. Dynamic route safety:
   - Files such as `pages/community/[slug].tsx`, `pages/technology/[slug].tsx`, `pages/tag/[slug].tsx`, and `pages/authors/[slug].tsx` must validate params, handle fallback states, and return `notFound` or a redirect for invalid slugs.
   - Category and slug mismatches must be guarded the way the existing community and technology routes do.

5. Data fetching must match Pages Router contracts:
   - `getStaticProps`, `getStaticPaths`, and `getServerSideProps` must return valid Next.js shapes.
   - New route data loaders should prefer parallel requests with `Promise.all` where independent.
   - Revalidation values should be explicit for cached content routes.

6. API routes must validate input and restrict side effects:
   - Query params must be parsed and validated before use.
   - Allowlists are required for external proxying, following `pages/api/proxy-image.ts`.
   - Preview and mutation-like endpoints must verify secrets or auth, following `pages/api/preview.ts`.

7. SEO and structured data are part of framework correctness here:
   - Changes touching `components/meta.tsx`, `components/layout.tsx`, `lib/structured-data.ts`, `utils/seo.ts`, `pages/_document.tsx`, or `pages/sitemap.xml.tsx` require careful cross-file review.
   - Structured data should come from `lib/structured-data.ts`, not ad hoc inline objects scattered across pages.

8. Base path awareness:
   - This site runs under `/blog` via `next.config.js`.
   - Review links, redirects, sitemap output, asset URLs, and Playwright navigation for base-path correctness.

9. Font handling:
   - Existing Google Fonts `<link>` tags in `pages/_document.tsx` are a known legacy pattern.
   - Do not re-flag them unless a change expands or duplicates the pattern.
   - For new font additions, prefer self-hosting or `next/font` where feasible.

10. Runtime config exposure:
   - `next.config.js` currently mirrors `WORDPRESS_API_URL` into `NEXT_PUBLIC_WORDPRESS_API_URL`.
   - Do not expose new server-only secrets through `env` or client bundles.
