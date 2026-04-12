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

  test('should render navigation links back to main sections', async ({ page }) => {
    const navLinks = page.locator('a[href*="/technology"], a[href*="/community"], a[href="/"], a[href="/blog/"]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should not render the global Footer on dedicated 404 layout', async ({ page }) => {
    const footer = page.locator('[data-testid="site-footer"]');
    await expect(footer).toHaveCount(0);
  });

  test('should not throw client-side errors (null title/excerpt regression)', async ({ page, baseURL }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    const notFoundUrl = baseURL ? `${baseURL}/this-page-does-not-exist-null-test` : 'http://localhost:3000/blog/this-page-does-not-exist-null-test';
    await page.goto(notFoundUrl);
    await page.waitForLoadState('load');
    const notFoundText = page.locator('text=/404|not found|page.*not.*exist/i');
    await expect(notFoundText.first()).toBeVisible({ timeout: 10000 });
    expect(errors).toHaveLength(0);
  });
});
