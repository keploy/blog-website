# Schema.org / JSON-LD Coverage Matrix

This document maps every schema.org JSON-LD `@type` emitted by the blog to the
builder function that constructs it and the page(s)/route(s) that render it.
It reflects the schema overhaul delivered in PR #411 (A1–A9 / AI1–AI6).

All JSON-LD construction lives in a single source of truth:

- `lib/structured-data.ts` — every builder except HowTo
- `lib/howToSchema.ts` — the HowTo builder (sources `@context` + `ImageObject` from the hub)

Every JSON-LD block is stringified through `safeJsonLdStringify` (guards against
`</script>` termination) before being injected as `<script type="application/ld+json">`.

Entity graph is de-fragmented via stable `@id`s so AI engines resolve one canonical
node instead of duplicates:

| Entity | `@id` |
|---|---|
| Organization | `…#organization` |
| Blog | `…#blog` |
| WebSite | `…#website` |
| SoftwareApplication | `…#software` |
| Author (per person) | `…/authors/{slug}#person` |

---

## Global schemas (emitted on every page)

Injected once in `pages/_document.tsx` `<Head>`, so they appear on every route.

| `@type` | Builder | File |
|---|---|---|
| `Organization` (+ nested `ContactPoint`) | `getOrganizationSchema()` | `lib/structured-data.ts` |
| `Blog` (+ `Organization`, `ImageObject`) | `getBlogSchema()` | `lib/structured-data.ts` |
| `SoftwareApplication` (+ `CreativeWork`) | `getSoftwareApplicationSchema()` | `lib/structured-data.ts` |

---

## Page → schema matrix

| Route | Page type | `@types` emitted | Builder(s) |
|---|---|---|---|
| `/` | Home | `WebSite`, `SearchAction`, `EntryPoint`, `CollectionPage`, `ItemList`, `ListItem`, `ImageObject`, `Blog` | `getWebSiteSchema`, `getCollectionPageSchema` |
| `/technology` | Category archive | `BreadcrumbList`, `ListItem`, `CollectionPage`, `ItemList`, `ImageObject`, `Blog` | `getBreadcrumbListSchema`, `getCollectionPageSchema` |
| `/technology/{slug}` | Article (tech) | **`TechArticle`**, `WebPage`, `ImageObject`, `Person`, `Organization`, `BreadcrumbList`, `ListItem` + conditionals below | `getBreadcrumbListSchema`, `getBlogPostingSchema`, `getHowToSchema`, `getFAQPageSchema`, `getSoftwareSourceCodeSchema`, `getDefinedTermSetSchema` |
| `/community` | Category archive | `BreadcrumbList`, `ListItem`, `CollectionPage`, `ItemList`, `ImageObject`, `Blog` | `getBreadcrumbListSchema`, `getCollectionPageSchema` |
| `/community/{slug}` | Article (community) | **`BlogPosting`**, `WebPage`, `ImageObject`, `Person`, `Organization`, `BreadcrumbList`, `ListItem` + conditionals below | `getBreadcrumbListSchema`, `getBlogPostingSchema`, `getHowToSchema`, `getFAQPageSchema`, `getSoftwareSourceCodeSchema`, `getDefinedTermSetSchema` |
| `/tag` | Tag directory | `BreadcrumbList`, `ListItem`, `CollectionPage`, `ItemList` | `getBreadcrumbListSchema`, `getCollectionPageSchema` |
| `/tag/{slug}` | Tag archive | `BreadcrumbList`, `ListItem`, `CollectionPage`, `ItemList`, `ImageObject` | `getBreadcrumbListSchema`, `getCollectionPageSchema` |
| `/authors` | Author directory | `BreadcrumbList`, `ListItem`, `CollectionPage`, `ItemList` | `getBreadcrumbListSchema`, `getCollectionPageSchema` |
| `/authors/{slug}` | Author profile | **`ProfilePage`**, **`Person`**, `Occupation`, `BreadcrumbList`, `ListItem`, `ItemList` (if authored posts) | `getBreadcrumbListSchema`, `getProfilePageSchema`, `getPersonSchema`, `getItemListSchema` |
| `/search` | Search results | `BreadcrumbList`, `ListItem` | `getBreadcrumbListSchema` |
| `/community/search` | Search results | `BreadcrumbList`, `ListItem` | `getBreadcrumbListSchema` |
| `/404` | Not found | *(none — by design)* | — |

> `/search` and `/community/search` are `noindex`, so they carry only a breadcrumb
> hint. `/404` carries no JSON-LD by design.

### Conditional schemas on article pages

Emitted on `/technology/{slug}` and `/community/{slug}` only when the post content triggers them:

| `@type` | Trigger | Builder |
|---|---|---|
| `HowTo`, `HowToStep`, `HowToTool`, `WebPage`, `ImageObject` | Post tagged `howto` / `how-to` / `tutorial` **and** ≥2 parseable steps | `getHowToSchema` |
| `FAQPage`, `Question`, `Answer` | Explicit in-post FAQ marker yields ≥2 clean Q/A pairs | `getFAQPageSchema` |
| `SoftwareSourceCode`, `WebPage` | One node per code language detected in post HTML | `getSoftwareSourceCodeSchema` |
| `DefinedTermSet`, `DefinedTerm` | Post has keyword-glossary tooltip terms | `getDefinedTermSetSchema` |
| `SpeakableSpecification` | Speakable selectors provided | `getBlogPostingSchema` (inline) |

---

## Builder reference

| Builder | `@types` emitted | Rendered on |
|---|---|---|
| `getOrganizationSchema()` | `Organization`, `ContactPoint` | global (`_document.tsx`) |
| `getBlogSchema()` | `Blog`, `Organization`, `ImageObject` | global (`_document.tsx`) |
| `getSoftwareApplicationSchema()` | `SoftwareApplication`, `CreativeWork` | global (`_document.tsx`) |
| `getWebSiteSchema()` | `WebSite`, `SearchAction`, `EntryPoint` | `/` |
| `getBreadcrumbListSchema()` | `BreadcrumbList`, `ListItem` | all archive/post/search pages |
| `getBlogPostingSchema()` | `BlogPosting` **or** `TechArticle`, `WebPage`, `ImageObject`, `Person` (author + reviewer), `Organization`, `SpeakableSpecification` | article pages |
| `getFAQPageSchema()` | `FAQPage`, `Question`, `Answer` | article pages (conditional) |
| `getSoftwareSourceCodeSchema()` | `SoftwareSourceCode`, `WebPage` | article pages (conditional) |
| `getDefinedTermSetSchema()` | `DefinedTermSet`, `DefinedTerm` | article pages (conditional) |
| `getHowToSchema()` | `HowTo`, `HowToStep`, `HowToTool`, `WebPage`, `ImageObject` | article pages (conditional) |
| `getItemListSchema()` | `ItemList`, `ListItem`, `ImageObject` | `/authors/{slug}` (conditional) |
| `getCollectionPageSchema()` | `CollectionPage`, `ItemList`, `ListItem`, `ImageObject`, `Blog` | home + all archive/directory pages |
| `getPersonSchema()` | `Person`, `Occupation` | `/authors/{slug}` |
| `getProfilePageSchema()` | `ProfilePage` (+ `Person` mainEntity) | `/authors/{slug}` |
| `getImageObjectSchema()` | `ImageObject` | helper — nested in the builders above, never standalone |

---

## Built but deliberately not emitted

| Builder | `@types` | Why unused |
|---|---|---|
| `getReviewSchema()` | `Review`, `Organization`, `Person` | Homepage testimonial wall is client-only (`next/dynamic`, `ssr:false`); emitting `Review` for content not in the server HTML is a Google penalty risk. Kept exported + unit-tested so it can be re-wired if the wall returns to SSR. |
| `getSearchResultsPageSchema()` | `SearchResultsPage`, `WebSite` | Search pages are `noindex`, so the markup is never processed — dead markup removed (round-1 review #8). |

Also not emitted at all (no builder), by design — see PR #411 "Not emitted":
`HowToSection`, `HowToTip`, `HowToSupply`, `Clip`, `Dataset`, `VideoObject`,
`Rating`, `AggregateRating`.

---

## Full-site validation

Per PR #411: the built site was crawled and every emitted block validated against
schema.org / Google Rich Results required + recommended fields:

```
1604 pages · 8656 JSON-LD blocks · every block parses · 0 errors · 0 warnings
```
