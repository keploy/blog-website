import { test, expect } from '@playwright/test';

test.describe('Search Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/search`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load search page successfully', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should not render global navigation on search layout', async ({ page }) => {
    const nav = page.locator('nav');
    const header = page.locator('header');
    expect((await nav.count()) + (await header.count())).toBe(0);
  });

  test('should not depend on header logo rendering on search layout', async ({ page }) => {
    const headerLogo = page.locator('header img[alt="Keploy Logo"]');
    await expect(headerLogo).toHaveCount(0);
  });

  test('should render the search input field', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]');
    await expect(searchInput.first()).toBeVisible();
  });

  test('should render post results or empty state', async ({ page }) => {
    const posts = page.locator('article, a[href*="/technology/"], a[href*="/community/"]');
    const emptyMessage = page.locator('text=/no posts|no results|not found/i');
    const postsCount = await posts.count();
    const emptyCount = await emptyMessage.count();
    expect(postsCount > 0 || emptyCount > 0).toBeTruthy();
  });

  test('should render the Footer component', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
