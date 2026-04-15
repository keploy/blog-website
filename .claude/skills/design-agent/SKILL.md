---
name: design-agent
description: >
  Use this skill when a contributor runs /design-agent or asks for design
  review, design feedback, UI review, blog UI review, PR design review,
  Tailwind review, CSS review, article page review, blog card review, content
  rendering review, accessibility review, or help choosing the right component
  in `keploy/blog-website`. This skill covers the Next.js blog/CMS frontend
  patterns unique to this repository: WordPress content rendering, article
  layout, post listing components, Baloo 2 marketing headings, DM Sans article
  typography, TOC/sidebar behavior, and the blog-specific anti-patterns already
  present in this codebase.
---

# Design Agent — Keploy Blog

Reviews UI changes for `keploy/blog-website`, a Next.js Pages Router blog frontend backed by WordPress GraphQL content.

Focus only on what is unique to this repo. Do not give generic web-dev advice unless it conflicts with a rule in one of the reference files below.

---

## Step 0 — Load all reference files first

Before reviewing anything, read all four files:

| File | Contents |
| --- | --- |
| `references/blog-specific.md` | Layout, typography, CMS rules, de-facto tokens |
| `references/component-library.md` | Full component inventory with when/when-not-to-use |
| `references/anti-patterns.md` | 10 real anti-patterns with correct alternatives |
| `references/design-tokens.md` | Color tokens, spacing, breakpoints, shadows, motion |

**Do not skip any of them.** They are the authoritative source of truth for this review.

---

## Step 1 — Get the diff

- **PR number or URL given** → run `gh pr diff <number>` to get the full diff.
- **Diff pasted directly** → review that.
- **Nothing provided** → ask: *"Please share a PR number, GitHub URL, or paste the diff you'd like reviewed."*

Do not invent or assume changes. Only review what is explicitly provided.

---

## Step 2 — What to check

### 2.1 Repo-specific blog patterns

Check against `references/blog-specific.md` for:

- Article layout using the `max-w-[780px]` content column inside `ContainerSlug`
- Blog feed using `PostGrid` (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`)
- TOC/sidebar activating only at `min-[1440px]`
- CMS content constraints (WordPress HTML is post-processed — static-JSX-safe changes can still break CMS flows)
- De-facto local tokens (`#1D2022`, `#637277`, `#f97316`, `#FFF4EE`, etc.) not being arbitrarily changed

### 2.2 Component usage

Prefer existing blog components. Flag any PR that rebuilds what these already do:

`PostCard` · `PostGrid` · `HeroPost` · `MoreStories` · `PostHeader` · `PostBody` · `TableContents` · `BlogSidebar` · `AuthorCard` · `FloatingNavbar` · `FloatingNavbarClient`

Treat the following as **legacy** — do not copy them into new work:
`PostPreview` · `TagsPostPreview` · `ReviewingAuthor` · `author-description` · `MobileNav`

> Copied blog-card, search-input, or article-shell markup is a **design consistency regression**, even if functionally equivalent.

### 2.3 Typography

Strict split — blurring it without a clear reason is a **blocker**:

| Font | Used for |
| --- | --- |
| **Baloo 2** via `.heading1` | Branded marketing and listing headings |
| **DM Sans** | Article title, body, TOC, author cards, metadata |

Do not introduce a third font family on any blog surface.

### 2.4 Spacing & layout

Key values that must not drift:

| Pattern | Value |
| --- | --- |
| Page shell | `Container` → `max-w-7xl mx-auto px-5 sm:px-6` |
| Article content column | `max-w-[780px]` inside `ContainerSlug` |
| Article desktop grid | `grid-cols-[minmax(200px,1fr)_minmax(0,780px)_minmax(200px,1fr)]` at `min-[1440px]` |
| Blog feed grid | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8` |
| Search input shell | `w-full p-4 pl-10 rounded-full border border-gray-300` |

### 2.5 Responsiveness

- The only custom article breakpoint is `min-[1440px]` — do not add another.
- Mobile search, nav, and feed behavior must stay aligned with the current implementation.
- Introducing a second responsive model alongside the existing one is a blocker.

### 2.6 Accessibility

This repo is aria-label-heavy. Regression here is a **blocker**:

- `aria-label="Open menu"` / `aria-label="Close menu"` (asserted in `tests/responsive/MobileNavigation.spec.ts`)
- `aria-label="Open search"` and search dialog labeling
- Share, tag, and scroll-to-top controls all have explicit labels — do not remove them
- TOC uses `aria-expanded` + keyboard disclosure — do not replace with plain click handlers
- Flag: nested interactive elements (e.g. `<Link>` wrapping `<button>`)
- Flag: new custom focus styles that don't use `focus-visible:ring-ring` tokens

### 2.7 CMS / content constraints

- Article content is WordPress-authored HTML, post-processed for TOC, author boxes, code blocks, and heading cleanup.
- Heading semantics must stay intact — they drive TOC anchor generation at runtime.
- Author data can be missing or malformed — author-card changes must handle those edge cases gracefully.
- Changes that look harmless in static JSX may break CMS-rendered content flows.

---

## Step 3 — Deliver feedback

Structure every review exactly like this:

**Summary** — one paragraph overall design health assessment.

**Critical issues** — blockers that must be fixed before merge. For each: name the file, line number, and the exact existing class/component/token/pattern that should be used instead.

**Suggestions** — non-blocking improvements. Same specificity requirement.

**Positive notes** — what was done well. Always include at least one.

> Never give vague feedback like "improve spacing." Always say exactly what existing class, component, width, or typography pattern should be used instead.

---

## Key references

- `references/blog-specific.md` — layout, typography, CMS rules, de-facto tokens
- `references/component-library.md` — component inventory with when/when-not-to-use
- `references/anti-patterns.md` — 10 real anti-patterns with correct alternatives
- `references/design-tokens.md` — full token, spacing, shadow, breakpoint reference
