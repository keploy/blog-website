# Hotspots

Top 20 most frequently changed files from git history.

1. `pages/community/[slug].tsx`
   - Commits touching file: 45
   - Why high-churn: primary community article route with SEO, content rendering, redirects, and fallback logic
   - Review priority: HIGH

2. `pages/technology/[slug].tsx`
   - Commits touching file: 44
   - Why high-churn: primary technology article route with similar metadata, routing, and content complexity
   - Review priority: HIGH

3. `components/post-body.tsx`
   - Commits touching file: 40
   - Why high-churn: shared article body renderer with HTML/content behavior and TOC interactions
   - Review priority: HIGH

4. `lib/api.ts`
   - Commits touching file: 38
   - Why high-churn: central WordPress GraphQL client and shared data contract surface
   - Review priority: HIGH

5. `components/more-stories.tsx`
   - Commits touching file: 26
   - Why high-churn: shared listing component used across route pages and post detail views
   - Review priority: HIGH

6. `components/layout.tsx`
   - Commits touching file: 21
   - Why high-churn: wraps every page and owns scripts, footer, and metadata plumbing
   - Review priority: HIGH

7. `components/header.tsx`
   - Commits touching file: 21
   - Why high-churn: global navigation and reading-progress surface with desktop/mobile variants
   - Review priority: HIGH

8. `pages/community/index.tsx`
   - Commits touching file: 20
   - Why high-churn: category landing page with search, listing, and metadata behavior
   - Review priority: HIGH

9. `package-lock.json`
   - Commits touching file: 20
   - Why high-churn: dependency lockfile changes whenever packages or versions move
   - Review priority: MEDIUM

10. `styles/index.css`
    - Commits touching file: 19
    - Why high-churn: global styling entrypoint with broad blast radius
    - Review priority: HIGH

11. `pages/technology/index.tsx`
    - Commits touching file: 19
    - Why high-churn: technology listing page with metadata and filtering behavior
    - Review priority: HIGH

12. `components/meta.tsx`
    - Commits touching file: 19
    - Why high-churn: central SEO, favicon, canonical, and OG tag component
    - Review priority: HIGH

13. `pages/index.tsx`
    - Commits touching file: 18
    - Why high-churn: homepage metadata and hero/listing composition change frequently
    - Review priority: HIGH

14. `components/footer.tsx`
    - Commits touching file: 18
    - Why high-churn: global footer links and social/navigation references
    - Review priority: MEDIUM

15. `package.json`
    - Commits touching file: 16
    - Why high-churn: script and dependency manifest for build and test tooling
    - Review priority: MEDIUM

16. `next.config.js`
    - Commits touching file: 16
    - Why high-churn: central runtime config for basePath, CSP, redirects, and images
    - Review priority: HIGH

17. `pages/authors/[slug].tsx`
    - Commits touching file: 15
    - Why high-churn: dynamic author page with slug normalization and content mapping
    - Review priority: HIGH

18. `pages/_document.tsx`
    - Commits touching file: 13
    - Why high-churn: global document shell, font loading, and schema injection
    - Review priority: HIGH

19. `components/postByAuthorMapping.tsx`
    - Commits touching file: 13
    - Why high-churn: author-to-post relationship rendering used by author pages
    - Review priority: MEDIUM

20. `components/post-preview.tsx`
    - Commits touching file: 13
    - Why high-churn: shared card component reused across lists and search surfaces
    - Review priority: MEDIUM
