# Static Sitemap Sync + Google Submission

## Summary

This change replaces the runtime-generated sitemap with a committed static sitemap and introduces two GitHub Actions workflows:

1. `sync-sitemap.yml`
   Regenerates `public/sitemap.xml` from WordPress on a schedule or manual trigger, then opens/updates a PR if the file changed.

2. `submit-google-sitemap.yml`
   Submits `https://keploy.io/blog/sitemap.xml` to Google Search Console after `public/sitemap.xml` is merged to `main`, or on manual trigger.

The result is:

- a sitemap that is versioned in git
- a reviewable PR whenever URLs or `lastmod` values change
- no runtime dependency on WordPress for serving the sitemap
- a clean, merge-based trigger for Google sitemap submission

## What Changed

### 1. Added a sitemap generator

File:
- [scripts/generate-sitemap.mjs](/Users/amaan-bhati/Documents/temp-blog-test/blog-website/scripts/generate-sitemap.mjs:1)

Purpose:
- fetch all relevant WordPress posts
- filter posts to routes that actually exist publicly
- generate the full sitemap from scratch
- write the result to `public/sitemap.xml`

Why this file exists:
- GitHub Actions needs a standalone generator it can run directly
- a static sitemap cannot be produced by the deleted runtime route anymore
- keeping this logic in one script is simpler than embedding GraphQL pagination and XML generation inside workflow YAML

Implementation notes:
- reads `WORDPRESS_API_URL`
- paginates through WPGraphQL posts ordered by `MODIFIED DESC`
- keeps only `community` and `technology`
- generates:
  - `https://keploy.io/blog`
  - `https://keploy.io/blog/community`
  - `https://keploy.io/blog/technology`
  - post URLs under `/blog/community/:slug` and `/blog/technology/:slug`
- normalizes `<lastmod>` to `YYYY-MM-DD`
- deduplicates URLs
- sorts post URLs deterministically for stable diffs

### 2. Added a static sitemap file

File:
- [public/sitemap.xml](/Users/amaan-bhati/Documents/temp-blog-test/blog-website/public/sitemap.xml:1)

Purpose:
- this is now the sitemap served publicly at `https://keploy.io/blog/sitemap.xml`
- this file is the source of truth tracked in git

Why this file exists:
- static file output avoids the 24-hour edge-cache ambiguity of the old runtime route
- sitemap changes become visible and reviewable in PRs
- production sitemap serving no longer depends on live WordPress availability

### 3. Added the sitemap sync workflow

File:
- [.github/workflows/sync-sitemap.yml](/Users/amaan-bhati/Documents/temp-blog-test/blog-website/.github/workflows/sync-sitemap.yml:1)

Purpose:
- regenerate `public/sitemap.xml` daily or manually
- create/update a PR only if the file changed

Why this file exists:
- sitemap generation is now a scheduled repo maintenance task
- this workflow is the automation entrypoint for keeping the static sitemap in sync with WordPress

Implementation notes:
- trigger:
  - daily cron
  - manual dispatch
- uses `WORDPRESS_API_URL=https://wp.keploy.io/graphql`
- runs `npm run generate:sitemap`
- checks `git diff -- public/sitemap.xml`
- opens/updates a PR via `peter-evans/create-pull-request`

PR conventions:
- branch: `automation/sync-sitemap`
- commit: `chore: sync sitemap.xml`
- PR title: `chore: sync sitemap.xml`

### 4. Added the Google submission workflow

File:
- [.github/workflows/submit-google-sitemap.yml](/Users/amaan-bhati/Documents/temp-blog-test/blog-website/.github/workflows/submit-google-sitemap.yml:1)

Purpose:
- submit the already-merged sitemap to Google Search Console

Why this file exists:
- Google sitemap submission should happen after the sitemap file has actually changed on `main`
- this keeps the Google notification tied to reviewed changes instead of runtime fetch timing

Implementation notes:
- trigger:
  - push to `main` when `public/sitemap.xml` changes
  - manual dispatch
- validates required Google secrets
- exchanges refresh token for an access token
- submits `https://keploy.io/blog/sitemap.xml` to Search Console via the Sitemaps API

### 5. Removed the runtime sitemap route

File removed:
- `pages/sitemap.xml.tsx`

Why it was removed:
- sitemap generation is no longer a runtime concern
- we do not want two competing sitemap implementations
- the static file now owns the public sitemap path

## Why We Chose This Design

The earlier runtime sitemap had two practical issues for the Google/Search Console flow:

1. it depended on WordPress at request time
2. it was cached for long periods, which made freshness verification unreliable

The static-file design improves this by making sitemap changes:

- deterministic
- reviewable
- merge-driven
- decoupled from runtime WordPress availability

It also fits the existing IndexNow setup better:

- `indexnow.yml` continues to handle recent URL notifications
- static sitemap + Google submission handles the authoritative sitemap path

## End-to-End Flow

### Workflow 1: Sync sitemap from WordPress

1. GitHub Action runs on schedule or manual trigger.
2. The repo is checked out.
3. Node is set up and dependencies are installed.
4. `npm run generate:sitemap` runs.
5. The generator fetches all relevant posts from WordPress.
6. The generator rebuilds `public/sitemap.xml` from scratch.
7. The workflow checks whether `public/sitemap.xml` changed.
8. If nothing changed, the workflow exits.
9. If it changed, the workflow creates or updates a PR.

### Workflow 2: Submit sitemap to Google

1. A sitemap PR is reviewed and merged to `main`.
2. The push to `main` changes `public/sitemap.xml`.
3. `submit-google-sitemap.yml` starts.
4. It validates required Google secrets.
5. It exchanges the refresh token for an OAuth access token.
6. It submits `https://keploy.io/blog/sitemap.xml` to Search Console.

## Environment Variables and Secrets

### Local / generator environment

Required for `scripts/generate-sitemap.mjs`:

- `WORDPRESS_API_URL`

Expected value:

```bash
WORDPRESS_API_URL=https://wp.keploy.io/graphql
```

### GitHub Actions secrets for Google submission

Required by `submit-google-sitemap.yml`:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_SEARCH_CONSOLE_SITE_URL`

Examples:

```text
GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:keploy.io
```

or

```text
GOOGLE_SEARCH_CONSOLE_SITE_URL=https://keploy.io/
```

## Implementation Details

### Why the generator fetches all posts

This is intentional.

`indexnow.yml` fetches only the latest 20 posts because IndexNow is about recent change notification.

The sitemap generator must fetch all sitemap-worthy posts because `public/sitemap.xml` is the full source-of-truth sitemap, not a recent-changes feed.

### Why `lastmod` is date-only

We explored preserving full timestamps from WordPress, but simplified the implementation to use `YYYY-MM-DD` only.

Reasons:
- smaller diffs
- simpler normalization
- less risk from timezone inconsistencies
- matches the previous runtime sitemap behavior more closely

### How diffs are detected

The checked-out repo already contains the current committed `public/sitemap.xml`.

The generator overwrites that same file with the newly generated version.

Then the sync workflow runs:

```bash
git diff --quiet -- public/sitemap.xml
```

If the file changed:
- a PR is created or updated

If it did not change:
- the workflow exits without opening a PR

## What We Explored

We explored and deliberately rejected a few other approaches:

### 1. Keep the runtime sitemap route and submit that to Google

Rejected because:
- runtime generation depended on WordPress availability
- edge caching made freshness checks ambiguous
- changes were not reviewable in git

### 2. Verify the latest 20 WordPress URLs against the live sitemap before Google submission

Rejected because:
- the old runtime sitemap used long cache durations
- this could produce false negatives even when WordPress had newer content

### 3. Use exact timestamps in `<lastmod>`

Explored, then simplified.

Rejected for now because:
- the added complexity was not buying much for this repo
- date-only is easier to reason about and review

## Required Operational Setup

Before the Google workflow can run successfully:

1. The Search Console property must already exist and be verified.
2. The Search Console API must be enabled in Google Cloud.
3. The OAuth client and refresh token must have access to that property.
4. The required GitHub secrets must be added.

## Validation Performed

The following checks were performed during implementation:

- generated `public/sitemap.xml` from the live WPGraphQL endpoint
- verified XML well-formedness with `xmllint`
- ran `npm run lint`
- ran `npm run build`

Build note:
- the app compiled successfully
- the final build step hit a sandbox `EPERM` listener restriction in this environment, which is unrelated to the sitemap implementation itself

## Sources

### Repo sources

- [scripts/generate-sitemap.mjs](/Users/amaan-bhati/Documents/temp-blog-test/blog-website/scripts/generate-sitemap.mjs:1)
- [public/sitemap.xml](/Users/amaan-bhati/Documents/temp-blog-test/blog-website/public/sitemap.xml:1)
- [.github/workflows/sync-sitemap.yml](/Users/amaan-bhati/Documents/temp-blog-test/blog-website/.github/workflows/sync-sitemap.yml:1)
- [.github/workflows/submit-google-sitemap.yml](/Users/amaan-bhati/Documents/temp-blog-test/blog-website/.github/workflows/submit-google-sitemap.yml:1)
- [.github/workflows/indexnow.yml](/Users/amaan-bhati/Documents/temp-blog-test/blog-website/.github/workflows/indexnow.yml:1)
- [public/robots.txt](/Users/amaan-bhati/Documents/temp-blog-test/blog-website/public/robots.txt:46)

### External sources

- Google Search Console API overview:
  https://developers.google.com/webmaster-tools/about
- Search Console Sitemaps API submit:
  https://developers.google.com/webmaster-tools/v1/sitemaps/submit
- Google Indexing API usage and eligibility:
  https://developers.google.com/search/apis/indexing-api/v3/using-api
- Google sitemap ping deprecation:
  https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
