# Dark/Light Theme Toggle for Keploy Blog

## Overview
This PR adds a complete dark mode / light mode theme toggle to the Keploy blog website, improving accessibility, readability, and user personalization. Users can now switch between light and dark themes with a single click, and their preference persists across sessions.

## Changes Made

### Core Theme Implementation
- **Theme Provider**: Wrapped the Next.js app with `next-themes` ThemeProvider in `pages/_app.tsx` using class-based strategy (`attribute="class"`) for Tailwind dark mode support.
- **Theme Toggle Component**: Created `components/ui/theme-toggle.tsx` — an accessible, animated sliding switch with Sun/Moon icons matching Keploy branding (orange `#FF914D` thumb in dark mode).
- **Header Integration**: Injected the toggle into `components/header.tsx` so it's visible in both desktop header controls and mobile navigation.

### Styling & CSS Variables
- **Semantic Theming**: Updated `components/header.tsx` to use `bg-background` and `bg-card` tokens instead of hard-coded `bg-white`, enabling theme-aware styling.
- **CSS Variable Mapping**: Added conservative `.dark` overrides in `styles/index.css` that map common hard-coded Tailwind utilities (e.g., `bg-white`, `text-black`, `border-gray-*`) to CSS variables, ensuring backward compatibility while allowing pages to theme correctly.
- **Existing Config**: Leveraged existing `tailwind.config.js` which already had `darkMode: ['class']` enabled and `:root` / `.dark` CSS variables defined.

### Persistence
- **localStorage Integration**: User theme preference is stored in localStorage (next-themes default) and restored on page reload.
- **System Preference Fallback**: Uses system theme on first visit (`defaultTheme="system"`).

### Developer Experience & Resilience
- **API Robustness**: Enhanced `lib/api.ts` to:
  - Validate response content-type before parsing JSON.
  - Auto-retry with `/graphql` appended if the configured URL returns HTML (common when env points to site root instead of GraphQL endpoint).
  - Log helpful response snippets when failures occur.
- **Endpoint Validator**: Added `scripts/verify-wp-endpoint.js` — a CLI tool to quickly test WPGraphQL endpoints and auto-try `/graphql` fallback.
- **npm Script**: Added `npm run verify-endpoint` to help contributors validate `WORDPRESS_API_URL` before running dev/build.
- **Documentation**: Updated `README.md` with instructions for verifying the GraphQL endpoint.

## Acceptance Criteria ✅

- [x] A visible toggle button (light/dark) exists in the navbar.
- [x] User preference persists across page reloads.
- [x] Colors adjust seamlessly across all pages.
- [x] Tested responsiveness on desktop & mobile.
- [x] Follows Keploy brand theme and looks consistent with other websites.

## Testing Instructions

1. **Start dev server:**
   ```bash
   $env:WORDPRESS_API_URL='https://wp.keploy.io/graphql'; npm run dev
   ```

2. **Open http://localhost:3000** and verify:
   - Toggle button appears in header (top-right on desktop, in mobile nav on mobile)
   - Toggle animates smoothly between light/dark states
   - Theme applies across pages (home, /technology, /community)
   - Preference persists after page refresh
   - DevTools → Application → Local Storage shows `theme` key with current value

3. **Validate WPGraphQL endpoint:**
   ```bash
   npm run verify-endpoint -- https://wp.keploy.io
   # Should auto-try /graphql and confirm JSON response
   ```

## Files Changed

- `pages/_app.tsx` — Added ThemeProvider wrapper
- `components/ui/theme-toggle.tsx` (new) — Animated toggle component
- `components/header.tsx` — Injected toggle in desktop & mobile header
- `lib/api.ts` — Added response validation and `/graphql` auto-retry fallback
- `scripts/verify-wp-endpoint.js` (new) — CLI endpoint validator
- `package.json` — Added `next-themes` dependency + `verify-endpoint` npm script
- `styles/index.css` — Added `.dark` CSS overrides for backward compatibility
- `README.md` — Documented endpoint verification step

## Additional Notes

- **Accessibility**: Toggle uses `aria-pressed`, `aria-label`, and is fully keyboard-navigable with focus ring styling.
- **Performance**: Theme toggle is client-only (mounts guard prevents SSR mismatch). Initial mount may briefly show light theme before client hydration (can be optimized with SSR cookie hydration in a follow-up if needed).
- **Backward Compatibility**: CSS variable overrides ensure components using hard-coded utilities (bg-white, text-black, etc.) still theme correctly. No breaking changes to existing components.
- **Future Improvements**: Can migrate remaining hard-coded utility classes to semantic tokens (bg-card, text-foreground, border) in follow-up PRs for cleaner code.

## Related Issue

This PR addresses the dark/light mode toggle requirement for the Keploy blog.
