import { test, expect } from '@playwright/test';

test.describe('Authors Index Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/authors`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load authors page successfully', async ({ page }) => {
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

  test('should render the page heading', async ({ page }) => {
    const heading = page.locator('h1').filter({ hasText: /authors/i });
    await expect(heading).toBeVisible();
  });

  test('should render author cards', async ({ page }) => {
    const authorCards = page.locator('a[href*="/authors/"]').or(
      page.locator('[class*="author"]').locator('a')
    );
    const count = await authorCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render the Footer component', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
