Keyword tooltip layer for high-intent terms across blog posts — hover a highlighted keyword and a product demo card appears above it with a short video, heading, and CTA. Disappears when the mouse leaves.

## What's in this PR

### Hover behaviour (fixed from original)

The previous implementation used a 2-second auto-close timer after hovering a keyword, which meant the tooltip disappeared mid-read. The new behaviour follows standard tooltip UX:

- Hover over a keyword → tooltip appears immediately
- Move mouse to the tooltip card → tooltip stays open
- Mouse leaves both the keyword and the card → tooltip closes (100ms debounce to prevent flicker when crossing the gap)
- No auto-close timer at all

### `components/KeywordTooltipLayer.tsx`

Portal-rendered tooltip card (`position: fixed`, anchored to the keyword's `getBoundingClientRect()`). Listens for hover via event delegation on `document` so it works across raw WordPress HTML rendered with `dangerouslySetInnerHTML`. Shows a video or image, a short heading, and a CTA button.

### `config/keyword-tooltips.ts`

Config-driven — one entry per keyword. Adding a new keyword to any blog is a single object in this file, no code changes needed.

**20 keyword entries across 4 blogs:**

**white-box-testing** (2 existing entries)
- `captured production traffic`
- `measurable quality signals`

**software-testing-basics** (6 entries)
- `unit testing` — first half, Testing Levels section
- `integration testing` — first half, Testing Levels section
- `acceptance testing` — first half, Testing Levels section
- `automated testing` — mid, Manual vs Automated section
- `API testing` — mid-late, Tool Selection section
- `shift-left` — conclusion, Emerging Trends section

**software-testing-strategies** (6 entries)
- `CI/CD pipelines` — first half, intro paragraph
- `microservices` — first half, intro paragraph
- `test automation` — first half, strategies overview
- `regression testing` — first half, strategy types section
- `API testing` — mid, strategy types section
- `shift-left testing` — conclusion, best practices section

**api-testing-strategies** (6 entries)
- `functional testing` — first half, testing types table
- `integration testing` — first half, testing types table
- `contract testing` — first half, testing types section
- `performance testing` — first half, performance section
- `shift-left testing` — mid-late, implementation framework
- `flaky tests` — conclusion, common challenges section

**Placement logic:** each keyword is injected only on its first occurrence in the blog HTML. This naturally places most tooltips in the first half of the article (where concepts are first introduced) and 1–2 in the conclusion or challenge sections where the same terms re-appear.

### `components/post-body.tsx`

Before the blog HTML hits the DOM, `injectTooltipSpans()` replaces the first match of each configured keyword with a dotted-underline `<span data-tt-key="...">` wrapper. `KeywordTooltipLayer` picks those spans up via hover through event delegation.
