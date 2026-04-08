import { test, expect } from '@playwright/test';

test.describe('404 Not Found Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/this-page-does-not-exist-12345`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load 404 page for non-existent URL', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should render the NotFoundPage component with 404 message', async ({ page }) => {
    const notFoundText = page.locator('text=/404|not found|page.*not.*exist/i');
    await expect(notFoundText.first()).toBeVisible();
  });

  test('should render the Navigation component', async ({ page }) => {
    const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
  });

  test('should render the Keploy logo in Navigation', async ({ page }) => {
    const headerLogo = page.locator('header img[alt="Keploy Logo"]').first();
      await expect(headerLogo).toBeVisible();
  });

  test('should render navigation links back to main sections', async ({ page }) => {
    const navLinks = page.locator('a[href*="/technology"], a[href*="/community"], a[href="/"], a[href="/blog/"]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should not render the global Footer on dedicated 404 layout', async ({ page }) => {
    const footer = page.locator('[data-testid="site-footer"]');
    await expect(footer).toHaveCount(0);
  });

  test('should not throw client-side errors (null title/excerpt regression)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(`${page.url()}`);
    await page.waitForLoadState('domcontentloaded');
    expect(errors).toHaveLength(0);
  });
});
