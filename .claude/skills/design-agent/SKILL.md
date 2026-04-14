name: design-agent
description: >
  Use this skill when a contributor runs /design-agent or asks for PR review,
  design review, design feedback, UI review, visual QA, design consistency,
  component usage guidance, Tailwind review, CSS review, accessibility review,
  layout review, spacing review, typography review, navbar review, blog card
  consistency, article page polish, or help choosing the right component in the
  Keploy blog codebase. Be strict about this repo's Tailwind and CSS
  conventions: prefer existing `components/ui` primitives, the orange-led
  gradient treatment, `heading1`/Baloo 2 for branded marketing headings, DM Sans
  for article surfaces, `PostCard`/`PostGrid`/`MoreStories` for post listings,
  and the existing article layout at 780px content width instead of inventing
  new UI patterns or arbitrary values.

Design Agent — Keploy Blog

This agent reviews UI changes for the Keploy Blog Next.js codebase. It checks PR
diffs against the repo's actual Tailwind theme, article typography system,
navigation patterns, reusable components, and accessibility behaviors so review
feedback is specific to this repository rather than generic frontend advice.

Trigger

This skill is invoked when a contributor uses /design-agent or asks for design
review, design feedback, or UI/UX guidance on a PR or commit.

What to review in a PR

When called on a PR or set of code changes, check for:

1. Token compliance

- Colors must prefer the repo palette in `tailwind.config.js`: `primary-*`,
  `secondary-*`, `neutral-*`, `accent-*`, `accent-1`, `accent-2`,
  `text-orange-500/600`, `from-orange-200`, `to-orange-100`, and the HSL CSS
  variable tokens in `styles/index.css`.
- Use theme tokens like `bg-card`, `text-card-foreground`, `border-border`,
  `ring-ring`, `bg-background`, and `text-foreground` when working inside
  `components/ui/*` patterns.
- Avoid new arbitrary colors such as `bg-[#3b82f6]`, `text-[#737373]`, or
  inline `style={{ color: ... }}` unless the file already follows that pattern
  and the PR is only touching that legacy surface.
- Prefer existing orange gradients and borders for marketing cards and CTAs:
  `bg-gradient-to-r from-orange-500 to-red-500`, gradient underline patterns,
  and orange hover states.
- Border radius should stay on existing values: `rounded-sm`, `rounded-md`,
  `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`, or theme radius
  tokens `lg/md/sm`. The global radius token is `0.5rem`.

2. Component usage

- Use `components/ui/button.tsx` for branded CTA buttons and icon buttons that
  match the existing navbar/404 patterns instead of introducing new raw button
  styling.
- Use `components/ui/card.tsx` for navbar dropdown cards and card-like shells
  before creating new bespoke wrappers.
- Use `PostCard` with `PostGrid` for post listing grids, not new ad hoc card
  markup.
- Use `HeroPost`, `MoreStories`, `TagsStories`, and `TopBlogs` for standard
  blog-feed sections instead of rebuilding those layouts.
- Use `CoverImage`, `Date`, `Avatar`, `Categories`, `PostHeader`, `PostTitle`,
  `TableContents`, `AuthorCard`, and `BlogSidebar` on article pages.
- Use `FloatingNavbar`, `FloatingNavbarClient`, and the `components/ui/*`
  primitives for navigation changes. Do not introduce a second mobile or
  desktop nav system.
- [inferred] Prefer extending an existing component over copying one of the many
  near-duplicate card or badge implementations already in the repo.

3. Typography

- Branded/marketing headings commonly use the `heading1` class, which maps to
  Baloo 2 in `styles/index.css`.
- Article content, article title, author cards, TOC, and metadata use DM Sans,
  often via inline styles or `post-body.module.css`.
- Article title hierarchy is fixed in `components/post-title.tsx` and
  `components/post-body.module.css`: title clamp `22px -> 42px`, article body
  clamp `15px -> 20px`, `h1` 2.25rem, `h2` 1.875rem, `h3` 1.5rem, `h4` 1.25rem,
  `h5` 1.125rem, `h6` 1rem italic.
- Body copy in list cards commonly uses muted gray text like `text-slate-600`,
  `text-gray-500`, or the DM Sans article colors `#637277` / `#374151`.
- Flag new typography that breaks this split, especially mixing random fonts,
  arbitrary font sizes, or another heading treatment where `heading1` or DM Sans
  patterns already exist.

4. Spacing & layout

- Default page shell uses `Container` (`max-w-7xl mx-auto px-5 sm:px-6`) and
  article shell uses `ContainerSlug` (`px-5 sm:px-6 lg:px-10 xl:px-16 2xl:px-20`).
- Standard feed grids use `PostGrid`: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`.
- Article pages use a `780px` centered content column, with a 3-column layout at
  `min-[1440px]` for TOC / content / sidebar.
- Common section spacing repeats throughout the repo: `mb-6`, `mb-8`,
  `mb-20 md:mb-28`, `mt-16`, `py-4`, `py-8`, `px-4`, `px-5`, `px-6`, `px-8`.
- Search bars usually use full-width pill inputs:
  `w-full p-4 pl-10 rounded-full border border-gray-300`.
- [inferred] Prefer existing container widths, gaps, and section rhythm before
  introducing new arbitrary paddings like `px-[37px]`.

5. Responsiveness

- Tailwind default breakpoints are in effect because `tailwind.config.js` does
  not override screens: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.
- The article layout and TOC introduce a custom arbitrary breakpoint at
  `min-[1440px]`; keep TOC/sidebar behavior aligned with that.
- Desktop navigation is `md+`; mobile nav toggles below `md`.
- Post grids collapse from 3 columns to 2 at `sm` and 1 on mobile.
- Flag desktop-only UI that lacks a mobile fallback, especially for nav,
  dropdowns, search, and article sidebars.

6. Accessibility

- Preserve explicit labels already used across the repo:
  `aria-label="Open menu"`, `aria-label="Close menu"`, `aria-label="Open search"`,
  `aria-label="Search blogs"`, `aria-label="Scroll to top"`, tag and share labels.
- Interactive disclosure patterns should expose `aria-expanded`.
- `components/ui/button.tsx`, `sheet.tsx`, and other UI primitives already carry
  `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`;
  prefer them over raw buttons.
- If using raw inputs/buttons in legacy surfaces, keep at least an obvious focus
  treatment such as `focus:ring-2` or a visible outline.
- Do not remove `sr-only` text from footer/social/search controls.
- Flag clickable `<Link><button /></Link>` nesting, missing labels on icon-only
  controls, and hover-only affordances with no keyboard-visible state.

7. Anti-patterns to flag

- Hardcoded hex/HSL/RGB values or inline styles when an existing Tailwind token
  or component already exists.
- New arbitrary values like `hover:shadow-[...]`, `rounded-[...]`,
  `text-[...]`, `bg-[#...]`, or `min-[...]` added without matching an existing
  repeated pattern.
- Rebuilding a post card instead of using `PostCard`.
- Rebuilding post grids instead of using `PostGrid`.
- Creating a second button visual language instead of reusing `Button` or an
  established repo CTA pattern.
- Mixing Baloo 2, DM Sans, default browser fonts, Arial, and Inter in the same
  surface without a clear reason.
- Adding one-off blue focus rings (`focus:ring-blue-500`) to new UI when the
  component can use repo ring tokens instead.
- Duplicating nearly identical search input, tag pill, or dropdown card markup
  without extracting or reusing a shared component. [inferred]
- Nesting interactive elements, especially `Link` wrapping `button`.
- Introducing decorative-only motion without respecting the existing lightweight
  animation patterns or `motion-reduce`.

How to deliver feedback

When reviewing a PR, structure your feedback as follows:

Summary — one paragraph overall design health assessment

Critical issues — things that must be fixed before merge (broken design tokens,
accessibility failures, missing required components)

Suggestions — things that would improve consistency but aren't blockers

Positive notes — what was done well (always include at least one)

Be specific. Reference actual line numbers or file names from the diff. Compare
against guidelines in the `references/` files. Never give vague feedback like
"improve spacing" — say exactly what class or token should be used instead.

Reference files

Read `references/design-tokens.md` for all color, spacing, and typography values

Read `references/component-library.md` for component usage rules

Read `references/anti-patterns.md` for patterns to flag in review
