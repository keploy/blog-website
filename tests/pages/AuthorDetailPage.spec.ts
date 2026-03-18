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
    expect(title).toBeDefined();
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
    const hasVisibleHeading = await heading.isVisible().catch(() => false);
    const hasVisiblePosts = await posts.isVisible().catch(() => false);
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
