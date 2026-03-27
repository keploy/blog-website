<p align="center">
  <img src="https://keploy.io/docs/img/keploy-logo-dark.svg" alt="Keploy Logo" width="200"/>
</p>

<h1 align="center">Keploy Blog</h1>

<p align="center">
  <b>The official blog for <a href="https://keploy.io">Keploy</a> — live at <a href="https://keploy.io/blog">keploy.io/blog</a></b>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-18-black?logo=next.js" alt="Next.js"/></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-4.7-blue?logo=typescript" alt="TypeScript"/></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/TailwindCSS-3.x-38bdf8?logo=tailwindcss" alt="Tailwind"/></a>
  <a href="https://www.wpgraphql.com"><img src="https://img.shields.io/badge/WordPress-GraphQL-21759b?logo=wordpress" alt="WPGraphQL"/></a>
</p>

---

## What is this?

A **Next.js (Pages Router)** blog application that powers the [Keploy Blog](https://keploy.io/blog). Content is authored in a headless **WordPress** instance and fetched at build time via the **WPGraphQL** plugin. The site is statically generated with **Incremental Static Regeneration (ISR)**, revalidating every 10 seconds for near-instant page loads and always-fresh content.

---

## Configuration

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
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

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-change`
3. Commit your changes: `git commit -m "feat: add new feature"`
4. Push to your fork: `git push origin feat/my-change`
5. Open a Pull Request — the PR template will guide you

The CI pipeline will automatically run a build check and Lighthouse audits on your PR.

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
| 2 | **Technology Listing** | [keploy.io/blog/technology](https://keploy.io/blog/technology) | `pages/technology/index.tsx` | Featured hero post + paginated grid of all technology category posts with infinite scroll |
| 3 | **Technology Post** | [keploy.io/blog/technology/\[slug\]](https://keploy.io/blog/technology/) | `pages/technology/[slug].tsx` | Individual technology blog post — includes sticky table of contents, syntax-highlighted code blocks, reading time, related posts, reviewing author, newsletter CTA |
| | | _Example:_ [keploy.io/blog/technology/api-testing-tools](https://keploy.io/blog/technology/api-testing-tools) | | |
| 4 | **Community Listing** | [keploy.io/blog/community](https://keploy.io/blog/community) | `pages/community/index.tsx` | Featured hero post + paginated grid of all community category posts with infinite scroll |
| 5 | **Community Post** | [keploy.io/blog/community/\[slug\]](https://keploy.io/blog/community/) | `pages/community/[slug].tsx` | Individual community blog post — same layout as technology posts (TOC, code blocks, related posts, etc.) |
| | | _Example:_ [keploy.io/blog/community/state-transition-testing](https://keploy.io/blog/community/state-transition-testing) | | |
| 6 | **Community Search** | [keploy.io/blog/community/search](https://keploy.io/blog/community/search) | `pages/community/search.tsx` | Full-text search scoped to community posts only |
| 7 | **Authors Listing** | [keploy.io/blog/authors](https://keploy.io/blog/authors) | `pages/authors/index.tsx` | Grid of all blog authors with avatars |
| 8 | **Author Profile** | [keploy.io/blog/authors/\[slug\]](https://keploy.io/blog/authors/) | `pages/authors/[slug].tsx` | Author bio, avatar, and all posts written by that author |
| | | _Example:_ [keploy.io/blog/authors/sancharini-panda](https://keploy.io/blog/authors/sancharini-panda) | | |
| 9 | **Tags Listing** | [keploy.io/blog/tag](https://keploy.io/blog/tag) | `pages/tag/index.tsx` | All tags displayed as cards with category-specific icons |
| 10 | **Tag Posts** | [keploy.io/blog/tag/\[slug\]](https://keploy.io/blog/tag/) | `pages/tag/[slug].tsx` | All posts filtered by a specific tag |
| | | _Example:_ [keploy.io/blog/tag/a2a](https://keploy.io/blog/tag/a2a) | | |
| 11 | **Global Search** | [keploy.io/blog/search](https://keploy.io/blog/search) | `pages/search.tsx` | Full-text search across all posts (technology + community) |
| 12 | **404** | [keploy.io/blog/404](https://keploy.io/blog/404) | `pages/404.tsx` | Custom animated "not found" page with Lottie animation |

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
| 1 | `/api/search-all` | `keploy.io/blog/api/search-all` | `pages/api/search-all.ts` | Server-side full-text search across all posts, returns JSON |
| 2 | `/api/nav-latest` | `keploy.io/blog/api/nav-latest` | `pages/api/nav-latest.ts` | Fetches latest posts for the navbar "Recent Posts" dropdown |
| 3 | `/api/preview` | `keploy.io/blog/api/preview` | `pages/api/preview.ts` | Enters Next.js preview mode to render WordPress draft posts |
| 4 | `/api/exit-preview` | `keploy.io/blog/api/exit-preview` | `pages/api/exit-preview.ts` | Exits preview mode and returns to static pages |
| 5 | `/api/proxy-image` | `keploy.io/blog/api/proxy-image` | `pages/api/proxy-image.ts` | Proxies WordPress-hosted images to avoid CORS/CSP issues |

### Navbar Structure

The floating navbar is a mega-menu with multi-column dropdowns. Its full configuration lives in `config/nav.ts`.

| Dropdown | Sections | Key Links |
|----------|----------|-----------|
| **Products** | Core Products, Key Features | Open Source Testing → [github.com/keploy/keploy](https://github.com/keploy/keploy), Enterprise Solution → [app.keploy.io](https://app.keploy.io), API Recording & Replay, Test Deduplication, Multi-Purpose Mocks |
| **Solutions** | Testing Types, Testing Methods | Test Data Generation, API Testing, Code Coverage, CI Testing, Regression Testing, Contract Testing |
| **Developers** | Documentation, Developer Resources | Getting Started → [keploy.io/docs](https://keploy.io/docs), API Reference, FAQs, Open Source Community, GitHub |
| **Blog** _(this site)_ | Technology, Community | [keploy.io/blog/technology](https://keploy.io/blog/technology), [keploy.io/blog/community](https://keploy.io/blog/community) |

---

## Tech Stack

| Layer | Technology | Used In |
|---|---|---|
| **Framework** | Next.js 18 (Pages Router, SSG + ISR) | Entire app |
| **Language** | TypeScript 4.7 | Entire app |
| **Styling** | Tailwind CSS 3 | All components |
| **Animations** | Framer Motion | `layout.tsx`, `PageLoader.tsx` (page transitions, loading) |
| **Animations** | GSAP | `subscribe-newsletter.tsx` (bunny animation) |
| **Animations** | React Spring | `header.tsx`, `post-preview.tsx`, `post-card.tsx`, slug pages (scroll-based spring animations) |
| **CMS** | WordPress + WPGraphQL | `lib/api.ts` (all data fetching) |
| **Code Highlighting** | Prism.js | `prism-loader.tsx` (syntax highlighting in blog posts) |
| **Code Editor** | CodeMirror + Dracula theme | `json-diff-viewer.tsx` (interactive code comparison) |
| **JSON Diffing** | json-diff-kit | `json-diff-viewer.tsx`, `post-body.tsx` |
| **Lottie Animations** | @lottiefiles/react-lottie-player | `PageLoader.tsx` (loading animation) |
| **UI Primitives** | Radix UI | `ui/accordion.tsx`, `ui/sheet.tsx`, `ui/navigation-menu.tsx` |
| **Icons** | Lucide React | `config/nav.ts`, navbar components |
| **Icons** | React Icons | `post-body.tsx`, `more-stories.tsx`, `NotFoundPage.tsx`, `tagIcons.ts` |
| **Date Formatting** | date-fns | `date.tsx` |
| **SEO** | JSON-LD Structured Data | `lib/structured-data.ts` (Organization, WebSite, BlogPosting, BreadcrumbList schemas) |
| **SEO** | Sitemap + robots.txt | `public/sitemap.xml`, `public/robots.txt` |
| **Analytics** | Google Analytics, Microsoft Clarity, Apollo | `layout.tsx` (tracking scripts) |
| **Deployment** | Vercel + CloudFront | Production at `keploy.io/blog` |
| **CI/CD** | GitHub Actions | `.github/workflows/build.yml`, `lighthouse_runner.yml` |

---

## Project Structure

```
blog-website/
├── pages/                  # Next.js page routes (see Site Map above)
│   └── api/                # API routes
├── components/             # 47+ React components
│   ├── navbar/             # Floating navbar with mega-menu dropdowns
│   │   ├── FloatingNavbar.tsx       # Navbar wrapper
│   │   ├── FloatingNavbarClient.tsx # Client-side navbar logic
│   │   ├── main-nav.tsx             # Desktop navigation
│   │   ├── mobile-nav.tsx           # Mobile navigation drawer
│   │   ├── github-stars.tsx         # Live GitHub star counter
│   │   ├── vscode-number.tsx        # VS Code installs counter
│   │   ├── nav-card.tsx             # Navbar dropdown card
│   │   └── icons.tsx                # SVG icon components
│   ├── ui/                 # UI Components
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   ├── navigation-menu.tsx
│   │   └── sheet.tsx
│   ├── layout.tsx          # Root layout: meta, footer, analytics, scroll-to-top
│   ├── post-body.tsx       # Blog post content renderer with code blocks
│   ├── more-stories.tsx    # Paginated post grid with infinite scroll
│   ├── testimonials.tsx    # Testimonials marquee carousel
│   ├── topBlogs.tsx        # Top blogs section (community + technology)
│   ├── TableContents.tsx   # Sticky table of contents sidebar
│   ├── subscribe-newsletter.tsx  # Newsletter subscription with GSAP animation
│   ├── footer.tsx          # Global footer with links and badges
│   ├── json-diff-viewer.tsx # Interactive JSON diff comparison (CodeMirror)
│   └── ...
├── lib/
│   ├── api.ts              # All WordPress GraphQL queries & data fetching
│   ├── structured-data.ts  # JSON-LD schema generators
│   └── constants.ts        # Site-wide constants (OG image URL, etc.)
├── config/
│   ├── nav.ts              # Navbar mega-menu configuration (products, solutions, developers)
│   └── redirect.ts         # URL redirect mappings
├── hooks/                  # Custom React hooks
│   ├── useGithubStars.tsx  # Fetches live GitHub star count
│   ├── useHeaderScroll.tsx # Show/hide header on scroll direction
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
│   └── excerpt.ts               # Post excerpt truncation
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
│   │   ├── build.yml           # CI build verification
│   │   ├── lighthouse_runner.yml   # Lighthouse audits runner
│   │   └── lighthouse_comment.yml  # Posts Lighthouse results to PRs
│   └── PULL_REQUEST_TEMPLATE.md
├── next.config.js          # Next.js config (basePath: /blog, CSP headers, image domains)
├── tailwind.config.js      # Tailwind theme extensions
└── package.json
```

---

## Key Features

- **Headless WordPress CMS** — Content managed in WordPress, fetched via GraphQL at build time
- **ISR (Incremental Static Regeneration)** — Pages revalidate every 10 seconds for fresh content without full rebuilds
- **SEO-First** — JSON-LD structured data (Organization, WebSite, BlogPosting, BreadcrumbList), meta tags, Open Graph, sitemap, and robots.txt
- **Mega-Menu Navbar** — Multi-column floating navigation with product cards, solution links, and developer resources
- **Full-Text Search** — Client-side search with server-side API backing (`/api/search-all`)
- **Pagination / Infinite Scroll** — Posts load progressively as the user scrolls
- **Syntax-Highlighted Code Blocks** — Prism.js for blog post code, CodeMirror for interactive JSON diffs
- **Table of Contents** — Auto-generated sticky sidebar TOC for blog posts
- **Testimonials Carousel** — Animated marquee showcase of community testimonials
- **Reading Time Estimates** — Calculated per-post reading duration
- **Preview Mode** — Authenticated preview of WordPress draft posts via `/api/preview`
- **Page Transitions** — Smooth fade-in animations via Framer Motion
- **Spring Animations** — Scroll-based animations on post cards and headers via React Spring
- **Newsletter Subscription** — Animated subscription form with GSAP bunny animation
- **Responsive Design** — Mobile-first layout with dedicated mobile navigation drawer
- **Lighthouse CI** — Automated performance, accessibility, and SEO audits on every PR

---


## License

This project is part of the [Keploy](https://github.com/keploy) open-source ecosystem.
