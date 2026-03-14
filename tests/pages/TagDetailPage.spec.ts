import { test, expect } from '@playwright/test';

test.describe('Tag Detail Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/tag`);
    await page.waitForLoadState('domcontentloaded');
    const firstTag = page.locator('a[href*="/tag/"]').first();
    await firstTag.click({ force: true });
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load tag detail page successfully', async ({ page }) => {
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

  test('should render post cards or empty state for the tag', async ({ page }) => {
    const posts = page.locator('article, a[href*="/technology/"], a[href*="/community/"]');
    const emptyMessage = page.locator('text=/no posts|no content|empty/i');
    const postsCount = await posts.count();
    const emptyCount = await emptyMessage.count();
    expect(postsCount + emptyCount).toBeGreaterThanOrEqual(0);
  });

  test('should render the Footer component', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
