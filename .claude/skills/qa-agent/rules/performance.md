# Performance Rules

1. No synchronous file I/O in request handlers, API routes, or build-time hot paths.

2. `useEffect` that fetches data should guard against stale updates.
   - Use aborting, cancellation, or mount guards for longer-lived async work.
   - Lightweight fire-and-forget fetches such as `hooks/useGithubStars.tsx` should still handle failures quietly and avoid repeated refetches.

3. Consider `React.memo` for components rendered repeatedly in lists when they receive complex object props and profile as hot.
   - Do not add it blindly.

4. Do not use anonymous functions as default props in shared components.

5. Prefer dynamic imports for heavy client-only components.
   - Existing examples: `components/PageLoader` in `pages/_app.tsx` and `components/post-body` in `pages/community/[slug].tsx`.
   - Review new heavy editors, animations, or diff viewers for lazy loading opportunities.

6. Do not import whole utility libraries when named imports will do.
   - Avoid whole-package `lodash` or large `date-fns` entrypoints.

7. Images above the fold must declare stable sizing.
   - Missing width and height, or missing `fill`, is blocking if it can trigger layout shift.

8. No blocking third-party scripts in `<head>`.
   - Use `next/script` with an appropriate strategy, following `components/layout.tsx` and `pages/_app.tsx`.

9. Prefer `Promise.all()` for independent async calls.
   - This is especially relevant in route data fetching and API aggregation.

10. Broad shared files deserve extra scrutiny:
    - `lib/api.ts`
    - `components/post-body.tsx`
    - `components/layout.tsx`
    - `components/meta.tsx`
    - `pages/community/[slug].tsx`
    - `pages/technology/[slug].tsx`

11. Base path regressions are performance bugs too:
    - broken asset URLs under `/blog` often show up as failed requests and layout flashes.
