import { test, expect } from '@playwright/test';

test.describe('Tag Detail Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/tag`);
    await page.waitForLoadState('domcontentloaded');
    const firstTag = page.locator('a[href*="/tag/"]').first();
    await expect(firstTag).toBeVisible({ timeout: 15000 });
    await expect(firstTag).toBeEnabled();
    await firstTag.click();
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

  test('should render tag section with heading and optional post cards', async ({ page }) => {
    const tagSection = page.locator('section.pb-16').first();
    await expect(tagSection).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Tags' }).first()).toBeVisible();
  });

  test('should render the Footer component', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
