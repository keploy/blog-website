import { test, expect } from '@playwright/test';

test.describe('Tags Index Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/tag`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load tags page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Tags/);
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
    const heading = page.locator('h1').filter({ hasText: /tags/i });
    await expect(heading).toBeVisible();
  });

  test('should render the Tag component with tag cards', async ({ page }) => {
    const tags = page.locator('a[href*="/tag/"]').or(
      page.locator('[class*="tag"]').locator('a')
    );
    const count = await tags.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render the search input for tags', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').or(
      page.locator('input[placeholder*="search" i]')
    );
    await expect(searchInput.first()).toBeVisible();
  });

  test('should render the Footer component', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
