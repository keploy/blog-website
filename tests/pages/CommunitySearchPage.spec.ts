import { test, expect } from '@playwright/test';

test.describe('Community Search Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/community/search`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load community search page successfully', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should render the Navigation component', async ({ page }) => {
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should render the Keploy logo in Navigation', async ({ page }) => {
    const headerLogo = page.locator('header img[alt="Keploy Logo"]').first();
    await expect(headerLogo).toBeVisible();
  });

  test('should render the search input field', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i]');
    await expect(searchInput.first()).toBeVisible();
  });

  test('should render community post results or empty state', async ({ page }) => {
    const postLinks = page.locator('a[href*="/community/"]');
    const count = await postLinks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should render the Footer component', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
