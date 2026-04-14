# Ignore Rules

Always skip these paths and patterns during QA review unless the user explicitly asks to inspect them:

- `node_modules/`
- `.next/`
- `out/`
- `dist/`
- `build/`
- `.git/`
- `*.min.js`
- `*.generated.*`
- `__generated__/`
- `coverage/`
- `.cache/`

Build and tooling artifacts from `.gitignore`:

- `.pnp/`
- `.pnp.js`
- `.yarn/install-state.gz`
- `.vercel/`
- `*.tsbuildinfo`
- `next-env.d.ts`
- `.early.coverage`
- `test-results/`
- `playwright-report/`
- `blob-report/`
- `playwright/.cache/`
- `playwright/.auth/`

Environment and local-only files:

- `.env`
- `.env*.local`
- `.env.test`
- `*.pem`
- `.DS_Store`
- `.idea/`

Project-specific generated or non-review targets discovered during reconnaissance:

- `public/llms.txt`
- `public/llms-full.txt`

Guidance:

- Skip screenshots, binary assets, and favicon bitmaps unless the change is explicitly about those assets.
- Do not review files matched by these patterns when computing impact or review scope.
