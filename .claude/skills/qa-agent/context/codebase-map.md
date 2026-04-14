# Codebase Map

## Project Identity

- Project: Keploy blog website
- Framework: Next.js Pages Router
- Runtime language: TypeScript with some legacy JavaScript files
- Data source: WordPress via WPGraphQL
- Notable dependency state: `next` is declared as `latest`, while `eslint-config-next` is pinned to `14.1.0`

## Router Strategy

- Active router: Pages Router
- Evidence:
  - `pages/` directory exists
  - `app/` directory does not exist
  - Dynamic routes live in `pages/community/[slug].tsx`, `pages/technology/[slug].tsx`, `pages/tag/[slug].tsx`, and `pages/authors/[slug].tsx`
- Base path: `/blog` from `next.config.js`

## Top-Level Structure

- `.claude/`: Claude-specific local config; skill directory was absent before this task
- `.github/`: CI workflows for build, Playwright, Lighthouse, and IndexNow submission
- `components/`: shared page sections, metadata wrappers, navbar, UI primitives, and content renderers
- `config/`: navigation and redirect mapping
- `design-agent/`: separate local agent-related work, not part of app runtime
- `docs/`: setup screenshots for README and project documentation assets
- `hooks/`: browser-side hooks such as header scroll and GitHub star count
- `lib/`: WordPress API client, constants, structured data, shared helpers
- `lottiefiles/`: animation assets
- `pages/`: Next.js routes, including API routes and dynamic content routes
- `public/`: static assets, favicon set, robots, llms files, avatars, and images
- `services/`: service wrappers such as tweet-related code
- `styles/`: global CSS
- `tests/`: Playwright component, page, responsive, and SEO coverage
- `types/`: shared post, author, and tag types
- `utils/`: SEO sanitizers, slug cleanup, reading time, and content helpers

## Key Shared Files

- `pages/_app.tsx`: global CSS, page loader, telemetry SDK, route change handling
- `pages/_document.tsx`: global font loading and organization/blog JSON-LD
- `components/layout.tsx`: wraps pages, injects metadata, footer, scroll-to-top, analytics, and third-party scripts
- `components/meta.tsx`: canonical, OG, Twitter, favicon, and structured data tags
- `lib/api.ts`: WordPress GraphQL fetch layer and shared CMS data helpers
- `lib/structured-data.ts`: central JSON-LD builders and site URL constants
- `utils/seo.ts`: title and description sanitization/fallback logic
- `next.config.js`: basePath, assetPrefix, CSP header, image config, and redirect rules
- `vercel.json`: deploy-time redirects and headers

## State Management

- No centralized state library detected
- No Redux, Zustand, React Query, or SWR detected
- State is mostly local component state with React hooks
- One local React context exists in `components/ui/collapsible.tsx`

## Data Fetching Pattern

- Primary pattern: `getStaticProps` and `getStaticPaths` for content pages
- `getServerSideProps` used for `pages/sitemap.xml.tsx`
- Shared data access through `lib/api.ts`
- Client-side fetch usage exists for lightweight enhancements such as `hooks/useGithubStars.tsx`
- Dynamic imports are used for client-only or heavier pieces such as `components/post-body.tsx` and `components/PageLoader`

## Quality Tooling

- ESLint: `.eslintrc.json` extends `next/core-web-vitals`
- TypeScript: `tsconfig.json` with `strict: false`, `allowJs: true`, and alias `@/*`
- End-to-end testing: Playwright via `playwright.config.ts`
- CI quality checks:
  - build on push and PR
  - Playwright E2E on push and PR
  - Lighthouse comparison on PR
  - IndexNow submission on push and schedule
- No Vale, markdownlint, or spell-check configuration detected

## Deployment And Hosting

- Deployment target: Vercel
- Evidence:
  - `vercel.json`
  - Vercel-specific headers and redirects
  - workflow and code comments referencing Vercel Functions and cron behavior

## CI/CD Pipeline

- `.github/workflows/build.yml`: installs dependencies and builds with production-like WordPress env vars
- `.github/workflows/playwright.yml`: runs Playwright Chromium tests
- `.github/workflows/lighthouse_runner.yml`: builds PR and main branches, runs Lighthouse against both
- `.github/workflows/indexnow.yml`: submits recently modified blog URLs to IndexNow on push and schedule

## Project-Specific Conventions And Risks

- SEO is a primary concern; recent history is dominated by meta, sitemap, redirect, and structured-data fixes
- Metadata is centralized, but pages still set route-local `<Head>` titles in addition to `Layout` and `Meta`
- The site depends on correct `/blog` base path behavior everywhere
- WordPress API URL is exposed to the browser as `NEXT_PUBLIC_WORDPRESS_API_URL`; new env exposure should be scrutinized carefully
- Existing Google Fonts links in `pages/_document.tsx` are legacy baseline, not the preferred pattern for new work
- The highest-risk regression areas are:
  - `pages/community/[slug].tsx`
  - `pages/technology/[slug].tsx`
  - `components/post-body.tsx`
  - `lib/api.ts`
  - `components/meta.tsx`
