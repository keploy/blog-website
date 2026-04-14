# Known Suppressions

## Explicit Suppressions Found

1. `components/TableContents.tsx:73`
   - Suppression: `eslint-disable-next-line react-hooks/exhaustive-deps`
   - Context: the effect measures rendered TOC height and attaches a resize listener once; it intentionally avoids dependency churn around refs and setter usage
   - Reviewer instruction: do not flag this unless the effect behavior changes or the suppression becomes broader than necessary

## TypeScript Ignore-Style Suppressions

- No `@ts-ignore` found in tracked `.ts` or `.tsx` files during reconnaissance
- No `@ts-expect-error` found in tracked `.ts` or `.tsx` files during reconnaissance
- No `noinspection` markers found in tracked `.ts` or `.tsx` files during reconnaissance

## Deliberate Pattern Deviations

1. `pages/_document.tsx`
   - Uses Google Fonts CDN `<link>` tags instead of `next/font`
   - Treat as legacy baseline; flag only when a change adds more CDN font usage or worsens the pattern

2. Mixed JS and TS codebase
   - Existing `.jsx` and `.js` files are intentional legacy carryovers in an otherwise TypeScript codebase
   - Do not flag their mere existence as a violation during review

Instruction: Do not flag these as violations unless the suppression itself is the problem.
