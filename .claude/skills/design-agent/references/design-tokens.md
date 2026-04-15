# Design Tokens

This document records only tokens and repeated design values found in the
codebase. Where the repo relies on Tailwind defaults rather than an explicit
override, that is marked as `[inferred]`.

## Stack

| Area | Value | Source |
| --- | --- | --- |
| Framework | Next.js Pages Router | `package.json`, `pages/*`, `next.config.js` |
| Styling | Tailwind CSS + global CSS + CSS Modules + inline styles | `tailwind.config.js`, `styles/index.css`, `*.module.css`, component files |
| UI primitives | shadcn/ui style setup with Radix primitives | `components.json`, `components/ui/*`, `package.json` |
| Utilities | `class-variance-authority`, `clsx`, `tailwind-merge` | `package.json`, `lib/utils/utils.ts` |

## Color Tokens

### Tailwind Theme Extensions

| Token/Class | Value | Notes | Source |
| --- | --- | --- | --- |
| `accent-1` | `#FAFAFA` | legacy neutral surface | `tailwind.config.js` |
| `accent-2` | `#EAEAEA` | legacy border | `tailwind.config.js` |
| `accent-7` | `#333` | preview alert background | `tailwind.config.js` |
| `success` | `#0070f3` | legacy success/link token | `tailwind.config.js` |
| `cyan` | `#79FFE1` | legacy accent | `tailwind.config.js` |
| `primary-50` | `#FFF` | marketing palette | `tailwind.config.js` |
| `primary-100` | `#FFB575` | marketing palette | `tailwind.config.js` |
| `primary-200` | `#FFD0A0` | marketing palette | `tailwind.config.js` |
| `primary-300` | `#ff914d` | primary orange | `tailwind.config.js` |
| `primary-400` | `#E67643` | darker orange | `tailwind.config.js` |
| `primary-500` | `#C95919` | dark orange/brown | `tailwind.config.js` |
| `primary-deep-orange` | `#F6734A` | custom named token | `tailwind.config.js` |
| `primary-yellow-orange` | `#FDAC14` | custom named token | `tailwind.config.js` |
| `secondary-50` | `#FFFFFF` | light surface | `tailwind.config.js` |
| `secondary-100` | `#29456E` | slate-blue | `tailwind.config.js` |
| `secondary-200` | `#537FA1` | lighter blue | `tailwind.config.js` |
| `secondary-300` | `#00163d` | dark navy | `tailwind.config.js` |
| `secondary-400` | `#000E27` | darker navy | `tailwind.config.js` |
| `secondary-500` | `#00061A` | near-black navy | `tailwind.config.js` |
| `neutral-100` | `#f5f5f5` | soft gray | `tailwind.config.js` |
| `neutral-200` | `#FFF` | white | `tailwind.config.js` |
| `neutral-300` | `#e6e2d4` | beige neutral | `tailwind.config.js` |
| `accent-100` | `#16704c` | green accent | `tailwind.config.js` |
| `accent-200` | `#5f3131` | brown accent | `tailwind.config.js` |
| `accent-300` | `#ef546b` | pink/red accent | `tailwind.config.js` |
| `accent-400` | `#d9cd9c` | tan accent | `tailwind.config.js` |
| `accent-500` | `#e6e2d4` | beige accent | `tailwind.config.js` |
| `accent-gradient` | `linear-gradient(to right, #F5F5F5, #E35134, #FF914D, #BE2C1B, #6F0A0D)` | custom gradient token | `tailwind.config.js` |
| `hero-gradient` | `linear-gradient(to bottom, rgba(246, 115, 74, 0.75), rgba(253, 172, 20, 0.75))` | custom background image | `tailwind.config.js` |

### CSS Variable Tokens Used By shadcn/Radix Surfaces

| Token | Light | Dark | Tailwind Class Usage | Source |
| --- | --- | --- | --- | --- |
| `--background` | `0 0% 100%` | `0 0% 3.9%` | `bg-background` | `styles/index.css` |
| `--foreground` | `0 0% 3.9%` | `0 0% 98%` | `text-foreground` | `styles/index.css` |
| `--card` | `0 0% 100%` | `0 0% 3.9%` | `bg-card` | `styles/index.css` |
| `--card-foreground` | `0 0% 3.9%` | `0 0% 98%` | `text-card-foreground` | `styles/index.css` |
| `--popover` | `0 0% 100%` | `0 0% 3.9%` | `bg-popover` | `styles/index.css` |
| `--popover-foreground` | `0 0% 3.9%` | `0 0% 98%` | `text-popover-foreground` | `styles/index.css` |
| `--primary` | `0 0% 9%` | `0 0% 98%` | `bg-primary`, `text-primary` | `styles/index.css`, `tailwind.config.js` |
| `--primary-foreground` | `0 0% 98%` | `0 0% 9%` | `text-primary-foreground` | `styles/index.css`, `tailwind.config.js` |
| `--secondary` | `0 0% 96.1%` | `0 0% 14.9%` | `bg-secondary`, `text-secondary` | `styles/index.css`, `tailwind.config.js` |
| `--secondary-foreground` | `0 0% 9%` | `0 0% 98%` | `text-secondary-foreground` | `styles/index.css`, `tailwind.config.js` |
| `--muted` | `0 0% 96.1%` | `0 0% 14.9%` | `bg-muted` | `styles/index.css` |
| `--muted-foreground` | `0 0% 45.1%` | `0 0% 63.9%` | `text-muted-foreground` | `styles/index.css` |
| `--accent` | `0 0% 96.1%` | `0 0% 14.9%` | `bg-accent` | `styles/index.css` |
| `--accent-foreground` | `0 0% 9%` | `0 0% 98%` | `text-accent-foreground` | `styles/index.css` |
| `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` | `bg-destructive` | `styles/index.css` |
| `--destructive-foreground` | `0 0% 98%` | `0 0% 98%` | `text-destructive-foreground` | `styles/index.css` |
| `--border` | `0 0% 89.8%` | `0 0% 14.9%` | `border-border` | `styles/index.css` |
| `--input` | `0 0% 89.8%` | `0 0% 14.9%` | `border-input` | `styles/index.css` |
| `--ring` | `0 0% 3.9%` | `0 0% 83.1%` | `ring-ring` | `styles/index.css` |
| `--chart-1` | `12 76% 61%` | `220 70% 50%` | `text-chart-1`, `bg-chart-1`, `border-chart-1` | `styles/index.css` |
| `--chart-2` | `173 58% 39%` | `160 60% 45%` | `text-chart-2`, `bg-chart-2`, `border-chart-2` | `styles/index.css` |
| `--chart-3` | `197 37% 24%` | `30 80% 55%` | `text-chart-3`, `bg-chart-3`, `border-chart-3` | `styles/index.css` |
| `--chart-4` | `43 74% 66%` | `280 65% 60%` | `text-chart-4`, `bg-chart-4`, `border-chart-4` | `styles/index.css` |
| `--chart-5` | `27 87% 67%` | `340 75% 55%` | `text-chart-5`, `bg-chart-5`, `border-chart-5` | `styles/index.css` |

### Repeated Hardcoded Colors In Components

These are not formal tokens, but they are repeated enough that PRs should be
compared against them.

| Value | Where It Appears | Source |
| --- | --- | --- |
| `#f97316` | links, bullets, role badges, active states, gradients, TOC active states | `components/post-body.module.css`, `components/AuthorCard.tsx`, `components/PostHeaderAuthors.tsx`, many components |
| `#FF914D` | hero CTA/orange border accents | `tailwind.config.js`, `components/AuthorCard.tsx`, `components/BlogSidebar.tsx` |
| `#1D2022` | DM Sans heading/body dark text | `components/post-card.tsx`, `components/BlogSidebar.tsx`, `components/AuthorHero.tsx`, `components/post-body.module.css` |
| `#637277` | muted body/meta text | `components/post-card.tsx`, `components/AuthorHero.tsx`, `components/post-body.module.css` |
| `#737373` | muted navbar helper text | `components/navbar/main-nav.tsx`, `components/navbar/nav-card.tsx` |
| `#1e1e2e` | code block/editor background | `styles/index.css`, `components/post-body.tsx`, `components/post-body.module.css` |
| `#313244` | code block border/header bg pair | `components/post-body.tsx`, `components/post-body.module.css` |
| `#cdd6f4` | code text | `styles/index.css`, `components/post-body.tsx`, `components/post-body.module.css` |
| `#FFF4EE` | sidebar CTA fallback/ad background | `components/BlogSidebar.tsx` |
| `#0A66C2` | LinkedIn action color | `components/BlogSidebar.tsx`, `components/AuthorCard.tsx` |
| `#0077B5` | LinkedIn hover for author hero icon | `components/AuthorHero.tsx` |

## Typography

### Fonts

| Token/Class | Value | Usage | Source |
| --- | --- | --- | --- |
| `heading1` | `"Baloo 2", "bold", sans-serif` | branded headings, landing sections, listing headers | `styles/index.css` |
| `body` | `"Baloo 2", sans-serif` | legacy marketing/body copy | `styles/index.css` |
| `baloo-2-600` | `"Baloo 2", sans-serif`, weight `600` | utility class | `styles/index.css` |
| `footer-font` | `__Inter_aaf875`, fallback | footer-only utility | `styles/index.css` |
| article/content font | `'DM Sans', sans-serif` | post title, article body, TOC, author cards | `post-body.module.css`, `post-title.tsx`, `AuthorCard.tsx`, `TableContents.tsx` |
| inline monospace | `ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace` | code | `post-body.module.css` |
| JSON diff font | `Arial, sans-serif` | legacy isolated component | `json-diff-viewer.module.css` |

### Font Sizes and Line Heights

| Token/Class | Value | Source |
| --- | --- | --- |
| `text-5xl` | `2.5rem` | `tailwind.config.js` |
| `text-6xl` | `2.75rem` | `tailwind.config.js` |
| `text-7xl` | `4.5rem` | `tailwind.config.js` |
| `text-8xl` | `6.25rem` | `tailwind.config.js` |
| `leading-tight` extension | `1.2` | `tailwind.config.js` |
| `tracking-tighter` extension | `-.04em` | `tailwind.config.js` |
| Post title | `clamp(1.375rem, 5vw, 2.625rem)`, `font-weight: 800`, `line-height: 1.25` | `components/post-title.tsx` |
| Article body | `clamp(0.9375rem, 2vw, 1.25rem)`, `line-height: 1.6` | `components/post-body.module.css` |
| Article `h1` | `2.25rem`, `line-height: 1.35`, `letter-spacing: -0.02em` | `components/post-body.module.css` |
| Article `h2` | `1.875rem`, `line-height: 1.4`, `letter-spacing: -0.015em` | `components/post-body.module.css` |
| Article `h3` | `1.5rem`, `line-height: 1.45`, `letter-spacing: -0.01em` | `components/post-body.module.css` |
| Article `h4` | `1.25rem`, `line-height: 1.5` | `components/post-body.module.css` |
| Article `h5` | `1.125rem`, `line-height: 1.5` | `components/post-body.module.css` |
| Article `h6` | `1rem`, italic | `components/post-body.module.css` |
| Mobile article body | `16px` | `components/post-body.module.css` |
| Mobile article `h1`/`h2`/`h3`/`h4` | `1.75rem` / `1.5rem` / `1.25rem` / `1.125rem` | `components/post-body.module.css` |

## Spacing Scale

### Explicit Theme Extensions

| Token/Class | Value | Source |
| --- | --- | --- |
| `spacing-28` | `7rem` | `tailwind.config.js` |

### Common Spacing Utilities Reused Across the Repo

| Pattern | Common Values Found | Source |
| --- | --- | --- |
| Container padding | `px-4`, `px-5`, `px-6`, `px-8`, `lg:px-10`, `xl:px-16`, `2xl:px-20` | `Container`, `ContainerSlug`, listing pages |
| Grid gaps | `gap-2`, `gap-3`, `gap-4`, `gap-5`, `gap-6`, `gap-8`, `gap-16` | cards, nav, author layouts |
| Vertical rhythm | `mb-6`, `mb-8`, `mb-10`, `mb-16`, `mb-20`, `md:mb-28`, `mt-16` | listings and article sections |
| Search input padding | `p-4 pl-10` | `MoreStories`, `tag/index`, `NotFoundPage` |
| Card padding | `p-4`, `p-5`, `p-6`, `px-8 py-8` | `PostCard`, nav cards, hero cards |
| Button padding | `px-4 py-2`, `px-6 py-2`, `px-8 py-3`, `px-8 py-4` | `styles/index.css`, buttons/components |

## Border Radius

| Token/Class | Value | Source |
| --- | --- | --- |
| `--radius` | `0.5rem` | `styles/index.css` |
| `rounded-lg` theme token | `var(--radius)` | `tailwind.config.js` |
| `rounded-md` theme token | `calc(var(--radius) - 2px)` | `tailwind.config.js` |
| `rounded-sm` theme token | `calc(var(--radius) - 4px)` | `tailwind.config.js` |
| Repeated card radii | `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full` | component files |
| Article images | `0.75rem` | `post-body.module.css` |
| Blockquotes | `0 8px 8px 0` | `post-body.module.css` |
| Inline code | `4px` | `post-body.module.css` |

## Shadows

| Token/Class | Value | Usage | Source |
| --- | --- | --- | --- |
| `shadow-sm` | Tailwind default `[inferred]` | cards, TOC, buttons | many components |
| `shadow-md` | Tailwind default `[inferred]` | hero/list hover, sidebars | many components |
| `shadow-lg` | Tailwind default `[inferred]` | CTA buttons, cards | many components |
| `shadow-xl` | Tailwind default `[inferred]` | CTA hover | `ui/button.tsx`, nav |
| navbar card shadow | `0 6px 14px rgba(0,0,0,0.10)` | nav cards | `navbar/main-nav.tsx`, `nav-card.tsx`, `FloatingNavbarClient.tsx` |
| navbar card hover shadow | `0 14px 30px rgba(0,0,0,0.18)` | nav card hover | same as above |
| floating nav shell | `0 18px 44px rgba(15,23,42,0.18)` | glass nav | `FloatingNavbar.tsx` |
| dropdown shell | `0 22px 54px rgba(15,23,42,0.22)` / `0 24px 72px rgba(0,0,0,0.24)` | glass dropdowns | `FloatingNavbarClient.tsx`, `ui/navigation-menu.tsx` |
| article code wrapper | `0 4px 12px rgba(0,0,0,0.12)` | post content wrapper | `styles/index.css` |
| JSON diff viewer | `0 2px 8px rgba(0,0,0,0.1)` and `0 1px 3px rgba(0,0,0,0.1)` | isolated legacy surface | `json-diff-viewer.module.css` |

## Breakpoints

| Breakpoint | Value | Status | Source |
| --- | --- | --- | --- |
| `sm` | `640px` | Tailwind default `[inferred]` | class usage throughout repo |
| `md` | `768px` | Tailwind default `[inferred]` | class usage throughout repo |
| `lg` | `1024px` | Tailwind default `[inferred]` | class usage throughout repo |
| `xl` | `1280px` | Tailwind default `[inferred]` | class usage throughout repo |
| `2xl` | `1536px` | Tailwind default `[inferred]` | class usage throughout repo |
| article/TOC desktop breakpoint | `1440px` | explicit arbitrary breakpoint | `post-body.tsx`, `TableContents.tsx` |
| mobile article table tweak | `1024px` | explicit media query | `styles/index.css` |
| article typography mobile tweak | `768px` | explicit media query | `post-body.module.css` |

## Motion and Animation Tokens

| Token/Class | Value | Source |
| --- | --- | --- |
| `animate-marquee` | `marquee var(--duration) linear infinite` | `tailwind.config.js`, `Marquee.tsx` |
| `animate-marquee-vertical` | `marquee-vertical var(--duration) linear infinite` | `tailwind.config.js`, `Marquee.tsx` |
| `animate-accordion-down` | `0.2s ease-out` | `tailwind.config.js` |
| `animate-accordion-up` | `0.2s ease-out` | `tailwind.config.js` |
| page fade-in | `fadeIn 0.3s ease-out` | `styles/index.css`, `layout.tsx` |
| custom spin | `5s linear infinite spin` | `styles/index.css` |

## Repeated Layout Widths

| Width | Usage | Source |
| --- | --- | --- |
| `max-w-7xl` | main page shell | `components/container.tsx` |
| `max-w-[1200px]` | footer shell | `components/footer.tsx` |
| `max-w-[780px]` | post header, TOC mobile wrapper, article body | `post-header.tsx`, `post-body.tsx`, `TableContents.tsx` |
| `grid-cols-[minmax(200px,1fr)_minmax(0,780px)_minmax(200px,1fr)]` | article desktop layout | `post-body.tsx` |
