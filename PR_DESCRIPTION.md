# PR: Detailed Issue-Wise Fix Description

## Overview
This PR documents all reported items that are fixed in the current blog codebase, in issue-wise format.

## Fixed Issues from Status Report

### 1) TASK-5
What was the issue:
- Sitemap lastmod freshness was not fully aligned with emitted post URLs, and hub freshness behavior was unstable.

How it was fixed:
- Sitemap now computes post freshness from category-filtered included posts.
- Hub routes use stable latestPostDate instead of daily-changing today.

Evidence:
- pages/sitemap.xml.tsx:86
- pages/sitemap.xml.tsx:121

### 2) GEO-12
What was the issue:
- Glossary needed DefinedTerm and DefinedTermSet structured data.

How it was fixed:
- Glossary page emits DefinedTermSet with hasDefinedTerm entries.

Evidence:
- pages/glossary/index.tsx:49
- pages/glossary/index.tsx:52

### 3) GEO-13
What was the issue:
- Technology blog posts were not mapped to TechArticle schema.

How it was fixed:
- Structured data now maps categorySlug technology posts to TechArticle.

Evidence:
- lib/structured-data.ts:137

### 4) TASK-17
What was the issue:
- BlogPosting dateModified handling was not safely guarded for missing values.

How it was fixed:
- dateModified now falls back to datePublished when missing.

Evidence:
- lib/structured-data.ts:159

### 5) GEO-15 (hub-level)
What was the issue:
- Case studies hub requirement was not satisfied at the hub level.

How it was fixed:
- Case studies hub exists with 5 entries and ItemList count wired to the dataset.

Evidence:
- pages/case-studies/index.tsx:8
- pages/case-studies/index.tsx:45

### 6) TASK-31
What was the issue:
- Newsletter visual image alt text was generic.

How it was fixed:
- Updated to descriptive alt text for better accessibility and SEO context.

Evidence:
- components/subscribe-newsletter.tsx:125

### 7) TASK-45
What was the issue:
- Legacy truncated backlink path /unit-test-generat was unresolved.

How it was fixed:
- Added permanent redirect for /unit-test-generat to the canonical destination.

Evidence:
- next.config.js:229

### 8) TASK-47
What was the issue:
- Broken backlink /test-case-generation was unresolved.

How it was fixed:
- Added permanent redirect for /test-case-generation to the canonical destination.

Evidence:
- next.config.js:234

## Additional Review-Driven Changes in This PR

### A) Sitemap regression coverage for hub URLs
What was the issue:
- E2E sitemap test did not assert newly added hub loc entries.

How it was fixed:
- Added assertions for integrations, solutions, case-studies, and glossary loc values.

File:
- tests/e2e/SeoMeta.spec.ts

### B) Preview mode propagation for solutions page
What was the issue:
- getStaticProps in solutions page was hard-coded to preview false.

How it was fixed:
- Updated getStaticProps to receive preview context and pass it through.

File:
- pages/solutions/index.tsx

## Validation
Executed:
- npx playwright test tests/e2e/SeoMeta.spec.ts --grep "sitemap.xml endpoint should return XML with the static blog entries"

Result:
- 1 passed

## Impact
1. Reported SEO/schema/redirect gaps listed above are now addressed in code.
2. Sitemap freshness signals are more accurate and stable.
3. Regression protection improved for sitemap hub URLs.
4. Preview behavior is corrected for solutions route.
