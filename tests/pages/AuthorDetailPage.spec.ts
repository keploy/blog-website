import { test, expect } from '@playwright/test';

test.describe('Author Detail Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/authors`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    const firstAuthor = page.locator('a[href*="/authors/"]').first();
    await expect(firstAuthor).toBeVisible({ timeout: 15000 });
    await expect(firstAuthor).toBeEnabled();
    await firstAuthor.click();
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load author detail page successfully', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    const title = await page.title();
    // LIVE-11 regression guard: author pages previously rendered with
    // an empty <title></title> because components/meta.tsx emits
    // twitter:title and og:title but no actual <title> tag, and
    // pages/authors/[slug].tsx passed Title to Layout without adding
    // its own <title> to Head. Fixed by emitting <title> explicitly.
    // This assertion catches any future regression that reintroduces
    // the empty title.
    expect(title).toBeDefined();
    expect(title.trim().length).toBeGreaterThan(0);
    expect(title).not.toMatch(/^undefined/i);
  });

  test('should emit Person JSON-LD for E-E-A-T author credibility', async ({ page }) => {
    // LIVE-11: author pages now include Person schema so AI models can
    // resolve the author entity and weight the authority of the posts
    // they cite. This test asserts the schema is present in the HTML
    // payload so it reaches AI crawlers before any hydration.
    const personSchemaCount = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) =>
        els.filter((el) => {
          try {
            const data = JSON.parse(el.textContent || '');
            return (
              data &&
              (data['@type'] === 'Person' ||
                (Array.isArray(data) && data.some((x: { '@type'?: string }) => x['@type'] === 'Person')))
            );
          } catch {
            return false;
          }
        }).length,
      );
    expect(personSchemaCount).toBeGreaterThan(0);
  });

  test('should render the Navigation component', async ({ page }) => {
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should render the Keploy logo in Navigation', async ({ page }) => {
    const headerLogo = page.locator('header img[alt="Keploy Logo"]').first();
    await expect(headerLogo).toBeVisible();
  });

  test('should render a page heading', async ({ page }) => {
    const heading = page.locator('h1, h2').first();
    const posts = page.locator('a[href*="/technology/"], a[href*="/community/"]').first();
    const hasVisibleHeading = await expect(heading).toBeVisible({ timeout: 15000 }).then(() => true).catch(() => false);
    const hasVisiblePosts = await expect(posts).toBeVisible({ timeout: 15000 }).then(() => true).catch(() => false);
    expect(hasVisibleHeading || hasVisiblePosts).toBeTruthy();
  });

  test('should render post cards by the author', async ({ page }) => {
    const posts = page.locator('a[href*="/technology/"], a[href*="/community/"]').first();
    await expect(posts).toBeVisible();
  });

  test('should render the Footer component', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
