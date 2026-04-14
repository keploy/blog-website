# TypeScript Rules

This repo uses TypeScript with `strict: false`, `allowJs: true`, and the `@/*` path alias from `tsconfig.json`. Review new code to a higher standard than the current baseline.

1. No `any` in new or changed code.
   - Use `unknown` plus narrowing, or define real interfaces and response types.
   - Be especially strict in shared files such as `lib/api.ts`, `components/layout.tsx`, and route props.

2. No non-null assertions (`!`) without an inline comment explaining why the value is guaranteed.

3. No `@ts-ignore`.
   - Prefer `@ts-expect-error` with a reason.
   - If an ignore-style suppression appears, treat it as a warning unless it is already documented in `context/known-suppressions.md`.

4. All exported functions should declare explicit return types.
   - This matters most in `lib/`, `utils/`, `hooks/`, and `pages/api/`.

5. Do not cast external data with `as Type` without validation.
   - WordPress GraphQL responses, environment variables, request query values, and JSON payloads must be checked before being trusted.

6. Prefer string literal unions over enums for UI and route state unless an enum provides a clear runtime benefit.

7. Do not accept implicit `any` from untyped packages.
   - Add `@types/*` or a local declaration when needed.

8. Generic parameters should be descriptive when the abstraction is non-trivial.
   - `T` is acceptable for a tiny generic helper.
   - For larger abstractions, prefer names like `TPost`, `TResponse`, or `TNode`.

9. Mixed JS and TS is allowed in this repo, but new shared logic should prefer `.ts` or `.tsx`.
   - Existing JS files such as `components/author-description.jsx`, `components/waitlistBanner.jsx`, and `tests/mock-server.js` are legacy patterns, not the preferred default.
