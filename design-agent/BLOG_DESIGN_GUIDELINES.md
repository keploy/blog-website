# Blog Design Guidelines (Repo-Local)

This file is **blog-specific** and is merged **after** the private common guidelines fetched at runtime. Keep this focused on *project realities* in `keploy/blog-website` and avoid duplicating the shared/common rules.

## 1) Tech stack

- Framework: Next.js (Pages Router) with `basePath: '/blog'` (`next.config.js`).
- Styling: Tailwind CSS (`tailwind.config.js`) + global CSS (`styles/index.css`) + component CSS modules (e.g. `components/post-body.module.css`).
- UI primitives: shadcn-style components under `components/ui/*` (CVA + `cn()` helper).
- Icons: `lucide-react`.
- Motion: `@react-spring/web`, `framer-motion`, `gsap` (prefer subtle/intentional use).
- Images: `next/image` with `images.remotePatterns` and `images.domains` in `next.config.js`.

## 2) Colors/tokens and brand mapping

Prefer Tailwind tokens over ad-hoc hex values.

- Brand accent: Orange → Red gradients are common.
  - Examples:
    - Button gradient: `from-orange-500 to-red-500` (`components/ui/button.tsx`).
    - Article links / accents: `#f97316` (orange) in `components/post-body.module.css`.
- Base surfaces:
  - Global page background: `#fbfcff`, base text: `#222222` (`styles/index.css`).
  - Article text: `#637277` / `#374151`; headings: `#1D2022` (`components/post-body.module.css`).
- Tailwind theme extensions:
  - `primary.*`, `secondary.*`, `accent.*`, plus gradients like `accent.gradient` (`tailwind.config.js`).

Guideline:
- When introducing new colors, first try mapping to existing Tailwind palette usage (`primary`, `secondary`, `accent`, `neutral`) or existing semantic colors in the article styles.
- Avoid mixing multiple near-identical grays/oranges in the same component unless there is a clear hierarchy reason.

## 3) Typography (Baloo 2 / DM Sans)

Fonts are loaded via Google Fonts in `pages/_document.tsx`:
- Baloo 2: preloaded then loaded as stylesheet.
- DM Sans: preloaded globally.

Project conventions:
- **DM Sans** is the primary font for blog reading experiences:
  - Used in article content (`components/post-body.module.css`) and many blog UI pieces (e.g. `components/post-title.tsx`, `components/post-card.tsx`).
- **Baloo 2** remains in global CSS utility classes (`styles/index.css`) and is used for some non-article surfaces.

Guideline:
- Do not add new font families without explicit product approval.
- Prefer CSS/Tailwind-driven typography for consistency; avoid one-off inline typography unless matching existing patterns.

## 4) Spacing/layout conventions

- Main container pattern: centered, wide layout with consistent horizontal padding:
  - `components/container.tsx`: `max-w-7xl mx-auto px-5 sm:px-6`.
- Navigation uses rounded, glassy surfaces with generous padding and responsive width changes (`components/navbar/FloatingNavbar.tsx`).
- Cards commonly use:
  - `rounded-lg`, `border border-gray-200`, subtle hover shadow and border color shift (`components/post-card.tsx`).

Guideline:
- Use Tailwind spacing scale (`p-*`, `gap-*`, `mt-*`) rather than custom pixel values, unless matching a proven existing component.
- Maintain consistent vertical rhythm in reading pages: headings/top borders in article CSS already define spacing—avoid reintroducing conflicting margins in MD/HTML renderers.

## 5) Components (buttons/cards/nav/forms)

Buttons (`components/ui/button.tsx`):
- Default button is gradient + rounded-full + shadow, with hover transitions.

Cards (`components/ui/card.tsx`, `components/post-card.tsx`):
- Favor `rounded-lg` + border + subtle shadows; interactive cards should have predictable hover states.

Nav (`components/navbar/*`):
- Glassmorphism patterns: blur + gradient + soft ring/border + large rounded radii.
- Mobile menu uses `Sheet` + `Collapsible` primitives (Radix-based).

Forms:
- Tailwind forms plugin is enabled (`@tailwindcss/forms` in deps); prefer it for input baseline styling.

Guideline:
- Reuse primitives from `components/ui/*` before creating new bespoke patterns.
- Keep interactive states (hover/focus/active/disabled) accessible and consistent with existing components.

## 6) Motion/icons/images

Motion:
- Prefer subtle transitions (150–300ms) and low-amplitude transforms.
- Avoid “always-on” heavy animations that distract from reading.

Icons:
- Prefer `lucide-react` for consistency.

Images:
- Use `next/image` for local assets and remote WP assets when feasible.
- Respect existing `next.config.js` `images.remotePatterns` / `domains`—do not introduce broad `*` or unsafe patterns.

## 7) Dark mode and responsive behavior

- Tailwind `darkMode: ['class']` is enabled (`tailwind.config.js`).

Guideline:
- If you add UI that can appear on pages using dark mode, ensure colors work with `dark:` variants or use semantic tokens.
- Ensure components are responsive (mobile first), especially navigation and post cards:
  - Prefer `clamp()` for typography where already used (e.g. post title).
  - Avoid fixed widths that break at `sm`/`md` breakpoints.

## 8) Anti-patterns (project-specific)

- Adding new brand colors without mapping to existing tokens (`primary/secondary/accent`) first.
- Introducing render-blocking font loads (do not use `@import` for fonts; keep font loading in `_document.tsx`).
- Shipping components with missing focus-visible states or relying only on hover for discoverability.
- Hardcoding many hex values in a single component when Tailwind tokens exist for the same roles.
- Adding large animations to reading pages without a clear UX reason.

## 9) PR checklist (design/UI changes)

- Visual regression check: verify navbar, post cards, and article pages (`/technology/*`, `/community/*`) at `sm`, `md`, `lg`.
- Accessibility: keyboard focus states, contrast for text/icons, no trapped scroll in overlays.
- Performance: avoid shipping large unoptimized images; confirm `next/image` usage.
- Consistency: reuse `components/ui/*` primitives and existing layout spacing.

## 10) Project-only “improvement suggestions” policy

When the design agent outputs **Improvement suggestions**, they must be:
- Non-blocking.
- Max 3 items.
- Specific to this repo’s patterns (e.g., “replace ad-hoc gray with existing article gray tokens”), not generic design advice.

