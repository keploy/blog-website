<p align="center">
  <img src="public/images/sidebyside-transparent.svg" alt="Keploy Logo" width="200"/>
</p>

<h1 align="center">Keploy Blog</h1>

<p align="center">
  <b>The official blog for <a href="https://keploy.io">Keploy</a> — live at <a href="https://keploy.io/blog">keploy.io/blog</a></b>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js"/></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-4.9-blue?logo=typescript" alt="TypeScript"/></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/TailwindCSS-3.x-38bdf8?logo=tailwindcss" alt="Tailwind"/></a>
  <a href="https://www.wpgraphql.com"><img src="https://img.shields.io/badge/WordPress-GraphQL-21759b?logo=wordpress" alt="WPGraphQL"/></a>
</p>

---

## What is this?

A **Next.js (Pages Router)** blog application that powers the [Keploy Blog](https://keploy.io/blog). Content is authored in a headless **WordPress** instance and fetched at build time via the **WPGraphQL** plugin. The site is statically generated with **Incremental Static Regeneration (ISR)**, revalidating every 10–60 seconds depending on the route for near-instant page loads and fresh content.

---

## Configuration

### Prerequisites

- **Node.js** ≥ 18
- **npm**
- A WordPress instance with the [WPGraphQL](https://www.wpgraphql.com/) plugin installed and activated

### 1. Clone the repo

```bash
git clone https://github.com/keploy/blog-website.git
cd blog-website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure:

```env
# Required — Your WordPress GraphQL endpoint
WORDPRESS_API_URL=https://wp.keploy.io/graphql

# Optional — Only needed for preview mode
# WORDPRESS_AUTH_REFRESH_TOKEN=
# WORDPRESS_PREVIEW_SECRET=
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000/blog](http://localhost:3000/blog) — note the `/blog` base path.

### 5. Build for production

```bash
npm run build
npm start
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-change`
3. Commit your changes: `git commit -m "feat: add new feature"`
4. Push to your fork: `git push origin feat/my-change`
5. Open a Pull Request — the PR template will guide you

The CI pipeline will automatically run a build check on your PR, and Lighthouse audits for code changes (not docs-only PRs).

---

## Deployment

The site is deployed on **Vercel**. CloudFront is configured to proxy `/blog/*` requests to the Vercel deployment, so CSS/JS assets resolve correctly under the `keploy.io` domain.

> **Note:** The `basePath: '/blog'` and `assetPrefix: '/blog'` settings in `next.config.js` are critical for this routing to work.

---

## Site Map

All pages are served under the base path `https://keploy.io/blog` (locally at `http://localhost:3000/blog`).

### Pages

| S.No | Page | Live URL | File Location | Description |
|------|------|----------|---------------|-------------|
| 1 | **Home** | [keploy.io/blog](https://keploy.io/blog) | `pages/index.tsx` | Hero section with CTA buttons, top blogs (community + technology), testimonials marquee carousel |
| 2 | **Technology Listing** | [keploy.io/blog/technology](https://keploy.io/blog/technology) | `pages/technology/index.tsx` | Featured hero post + paginated grid of all technology category posts with a Load More button (background pre-fetching) |
| 3 | **Technology Post** | [keploy.io/blog/technology/\[slug\]](https://keploy.io/blog/technology/) | `pages/technology/[slug].tsx` | Individual technology blog post — includes sticky table of contents, syntax-highlighted code blocks, reading time, and related posts |
| | | _Example:_ [keploy.io/blog/technology/api-testing-tools](https://keploy.io/blog/technology/api-testing-tools) | | |
| 4 | **Community Listing** | [keploy.io/blog/community](https://keploy.io/blog/community) | `pages/community/index.tsx` | Featured hero post + paginated grid of all community category posts with a Load More button (background pre-fetching) |
| 5 | **Community Post** | [keploy.io/blog/community/\[slug\]](https://keploy.io/blog/community/) | `pages/community/[slug].tsx` | Individual community blog post — same layout as technology posts (TOC, code blocks, related posts, etc.) |
| | | _Example:_ [keploy.io/blog/community/state-transition-testing](https://keploy.io/blog/community/state-transition-testing) | | |
| 6 | **Community Search** | [keploy.io/blog/community/search](https://keploy.io/blog/community/search) | `pages/community/search.tsx` | Client-side search over title and excerpt across all posts, scoped to the community section UI |
| 7 | **Authors Listing** | [keploy.io/blog/authors](https://keploy.io/blog/authors) | `pages/authors/index.tsx` | Grid of all blog authors with avatars |
| 8 | **Author Profile** | [keploy.io/blog/authors/\[slug\]](https://keploy.io/blog/authors/) | `pages/authors/[slug].tsx` | Author bio, avatar, and all posts written by that author |
| | | _Example:_ [keploy.io/blog/authors/sancharini-panda](https://keploy.io/blog/authors/sancharini-panda) | | |
| 9 | **Tags Listing** | [keploy.io/blog/tag](https://keploy.io/blog/tag) | `pages/tag/index.tsx` | All tags displayed as pill buttons with category-specific icons |
| 10 | **Tag Posts** | [keploy.io/blog/tag/\[slug\]](https://keploy.io/blog/tag/) | `pages/tag/[slug].tsx` | All posts filtered by a specific tag |
| | | _Example:_ [keploy.io/blog/tag/a2a](https://keploy.io/blog/tag/a2a) | | |
| 11 | **Global Search** | [keploy.io/blog/search](https://keploy.io/blog/search) | `pages/search.tsx` | Client-side search across pre-fetched posts (technology + community) |
| 12 | **404** | [keploy.io/blog/404](https://keploy.io/blog/404) | `pages/404.tsx` | Custom not found page with auto-redirect countdown and latest post suggestions |

### URL Pattern Summary

```
https://keploy.io/blog/
├── /                                          → Home
├── /technology                                → Technology listing
│   └── /technology/{post-slug}                → e.g., /technology/api-testing-tools
├── /community                                 → Community listing
│   ├── /community/{post-slug}                 → e.g., /community/state-transition-testing
│   └── /community/search                      → Community-scoped search
├── /authors                                   → All authors
│   └── /authors/{author-slug}                 → e.g., /authors/sancharini-panda
├── /tag                                       → All tags
│   └── /tag/{tag-slug}                        → e.g., /tag/a2a
├── /search                                    → Global search
└── /404                                       → Not found page
```

### API Routes

| S.No | Route | Live URL | File Location | Description |
|------|-------|----------|---------------|-------------|
| 1 | `/api/search-all` | `keploy.io/blog/api/search-all` | `pages/api/search-all.ts` | Returns all community and technology posts as JSON for client-side filtering |
| 2 | `/api/nav-latest` | `keploy.io/blog/api/nav-latest` | `pages/api/nav-latest.ts` | Returns the latest 4 posts each for the Technology and Community navbar dropdowns |
| 3 | `/api/preview` | `keploy.io/blog/api/preview` | `pages/api/preview.ts` | Enters Next.js preview mode to render WordPress draft posts |
| 4 | `/api/exit-preview` | `keploy.io/blog/api/exit-preview` | `pages/api/exit-preview.ts` | Exits preview mode and returns to static pages |
| 5 | `/api/proxy-image` | `keploy.io/blog/api/proxy-image` | `pages/api/proxy-image.ts` | Proxies external images (WordPress, Gravatar, Twitter/X) through an allowlist to avoid CORS/CSP issues |

### Navbar Structure

The floating navbar is a mega-menu with multi-column dropdowns. The Technology and Community dropdown cards are populated dynamically from the `/api/nav-latest` endpoint. The Resources dropdown links are hardcoded in `FloatingNavbarClient.tsx`.

| Dropdown | Description | Key Links |
|----------|-------------|-----------|
| **Technology** | Latest technology blog posts, shown as cards in the dropdown | [keploy.io/blog/technology](https://keploy.io/blog/technology) |
| **Community** | Latest community blog posts, shown as cards in the dropdown | [keploy.io/blog/community](https://keploy.io/blog/community) |
| **Resources** | Links to the broader Keploy ecosystem (Products, Solutions, Developers, Docs) | [keploy.io/docs](https://keploy.io/docs), [github.com/keploy](https://github.com/keploy), [app.keploy.io](https://app.keploy.io) |

---

## Tech Stack

| Layer | Technology | Used In |
|---|---|---|
| **Framework** | Next.js 14 (Pages Router, SSG + ISR) | Entire app |
| **Language** | TypeScript 4.9 | Entire app |
| **Styling** | Tailwind CSS 3 | All components |
| **Animations** | Framer Motion | `PageLoader.tsx` (loading animation) |
| **Animations** | React Spring | `header.tsx`, `post-card.tsx`, slug pages (scroll-based spring animations) |
| **CMS** | WordPress + WPGraphQL | `lib/api.ts` (all data fetching) |
| **Code Editor** | CodeMirror + Dracula theme | `post-body.tsx` (syntax-highlighted code blocks), `json-diff-viewer.tsx` (interactive JSON comparison) |
| **JSON Diffing** | json-diff-kit | `json-diff-viewer.tsx` |
| **Lottie Animations** | @lottiefiles/react-lottie-player | `PageLoader.tsx` (loading animation) |
| **UI Primitives** | Radix UI | `ui/accordion.tsx`, `ui/sheet.tsx`, `ui/navigation-menu.tsx` |
| **Icons** | Lucide React | `config/nav.ts`, navbar components |
| **Icons** | React Icons | `post-body.tsx`, `more-stories.tsx`, `NotFoundPage.tsx`, `tagIcons.ts` |
| **Date Formatting** | date-fns | `date.tsx` |
| **SEO** | JSON-LD Structured Data | `lib/structured-data.ts` (Organization, WebSite, BlogPosting, TechArticle, BreadcrumbList schemas) |
| **SEO** | Sitemap + robots.txt | `public/sitemap.xml`, `public/robots.txt` |
| **Analytics** | Google Analytics, Microsoft Clarity, Apollo | `layout.tsx` (tracking scripts) |
| **Deployment** | Vercel + CloudFront | Production at `keploy.io/blog` |
| **CI/CD** | GitHub Actions | `build.yml`, `lighthouse_runner.yml`, `playwright.yml`, `indexnow.yml`, `submit-google-sitemap.yml`, `sync-sitemap.yml` |

---

## Project Structure

```
blog-website/
├── pages/                  # Next.js page routes (see Site Map above)
│   └── api/                # API routes
├── components/             # 60 React components
│   ├── navbar/             # Floating navbar with mega-menu dropdowns
│   │   ├── FloatingNavbar.tsx       # Navbar wrapper
│   │   ├── FloatingNavbarClient.tsx # Client-side navbar logic
│   │   ├── main-nav.tsx             # Desktop mega-menu (Products/Solutions/Developers/Resources — not currently wired into the blog)
│   │   ├── mobile-nav.tsx           # Mobile navigation drawer (not currently used — mobile menu is built into FloatingNavbarClient.tsx)
│   │   ├── github-stars.tsx         # Live GitHub star counter
│   │   ├── vscode-number.tsx        # VS Code installs counter
│   │   ├── nav-card.tsx             # Navbar dropdown card (not currently used — only referenced by main-nav.tsx)
│   │   └── icons.tsx                # SVG icon components
│   ├── ui/                 # UI Components
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── collapsible.tsx
│   │   ├── navigation-menu.tsx
│   │   └── sheet.tsx
│   ├── layout.tsx          # Root layout: meta, footer, analytics, scroll-to-top
│   ├── post-body.tsx       # Blog post content renderer with code blocks
│   ├── more-stories.tsx    # Paginated post grid with Load More button and background pre-fetching
│   ├── testimonials.tsx    # Testimonials marquee carousel
│   ├── topBlogs.tsx        # Top blogs section (community + technology)
│   ├── TableContents.tsx   # Sticky table of contents sidebar
│   ├── subscribe-newsletter.tsx  # Newsletter subscription component (not currently wired into any page)
│   ├── footer.tsx          # Global footer with site links and social icons
│   ├── json-diff-viewer.tsx # Interactive JSON diff comparison (CodeMirror)
│   └── ...
├── lib/
│   ├── api.ts              # All WordPress GraphQL queries & data fetching
│   ├── structured-data.ts  # JSON-LD schema generators
│   ├── howToSchema.ts      # HowTo JSON-LD builder for tutorial blog posts
│   ├── constants.ts        # Site-wide constants (OG image URL, etc.)
│   └── utils/utils.ts      # Shared utility helpers (cn, classname merging)
├── config/
│   ├── nav.ts              # Mega-menu configuration for the main keploy.io website navbar (Products, Solutions, Developers, Resources)
│   └── redirect.ts         # URL redirect mappings
├── hooks/                  # Custom React hooks
│   ├── useGithubStars.tsx  # Fetches live GitHub star count
│   ├── useHeaderScroll.tsx # Returns true when page is scrolled past 40px — triggers navbar style changes
│   └── useVSCodeInstalls.tsx  # Fetches VS Code extension install count
├── services/
│   ├── Tweets.tsx          # Twitter/X testimonial data
│   └── constants.ts        # Service-level constants
├── types/                  # TypeScript type definitions
│   ├── post.ts
│   ├── author.ts
│   └── tag.ts
├── utils/
│   ├── calculateReadingTime.ts  # Reading time estimation
│   ├── tagIcons.ts              # Tag → icon mapping
│   ├── sanitizeAuthorSlug.ts    # Author URL sanitization
│   ├── sanitizeStringForUrl.ts  # Generic URL sanitization
│   ├── excerpt.ts               # Post excerpt truncation
│   ├── extractAuthorData.ts     # Author data extraction helpers
│   ├── seo.ts                   # SEO utility helpers
│   └── aiReferralTracker.ts     # AI referral source tracking
├── public/
│   ├── images/             # Static images and illustrations
│   ├── avatars/            # Testimonial avatars
│   ├── favicon/            # Favicon set
│   ├── robots.txt          # Crawl rules
│   └── sitemap.xml         # Generated sitemap
├── styles/
│   └── index.css           # Global styles + Tailwind directives
├── .github/
│   ├── workflows/
│   │   ├── build.yml                # CI build verification
│   │   ├── lighthouse_runner.yml    # Lighthouse audits (skipped for docs-only PRs)
│   │   ├── playwright.yml           # E2E tests
│   │   ├── indexnow.yml             # IndexNow pings for search engine indexing
│   │   ├── submit-google-sitemap.yml  # Submits sitemap to Google Search Console
│   │   └── sync-sitemap.yml         # Regenerates and commits sitemap on a daily schedule
│   └── PULL_REQUEST_TEMPLATE.md
├── next.config.js          # Next.js config (basePath: /blog, CSP headers, image domains)
├── tailwind.config.js      # Tailwind theme extensions
└── package.json
```

---

## Key Features

- **Headless WordPress CMS** - Content managed in WordPress, fetched via GraphQL at build time
- **ISR (Incremental Static Regeneration)** - Pages revalidate every 10–60 seconds depending on the route for fresh content without full rebuilds
- **SEO-First** - JSON-LD structured data (Organization, WebSite, BlogPosting, TechArticle, BreadcrumbList), meta tags, Open Graph, sitemap, and robots.txt
- **Mega-Menu Navbar** - Floating navbar with Technology, Community, and Resources dropdowns
- **Search** - Client-side filtering over posts pre-fetched at build time via `getStaticProps`
- **Pagination** - Posts load in batches of 9 via a Load More button; next batch is pre-fetched in the background to reduce wait time
- **Interactive JSON Diffs** - CodeMirror with Dracula theme for side-by-side JSON comparison in posts
- **Table of Contents** - Auto-generated sticky sidebar TOC for blog posts
- **Testimonials Carousel** - Animated marquee showcase of community testimonials
- **Reading Time Estimates** - Calculated per-post reading duration
- **Preview Mode** - Authenticated preview of WordPress draft posts via `/api/preview`
- **Page Load Animation** - Framer Motion powered loading screen via `PageLoader.tsx`
- **Spring Animations** - Scroll-based animations on post cards and headers via React Spring
- **Responsive Design** - Mobile-first layout with dedicated mobile navigation drawer
- **Lighthouse CI** - Automated performance, accessibility, and SEO audits on code PRs (skipped for docs-only changes)

---

## License

This project is part of the [Keploy](https://github.com/keploy) open-source ecosystem.
