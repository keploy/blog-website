import { test, expect } from '@playwright/test';
import { openLink } from '../support/openLink';

test.describe('Tag Detail Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/tag`);
    await page.waitForLoadState('domcontentloaded');
    // Ready once the tag's own story list (components/TagsStories.tsx) is up.
    await openLink(page, page.locator('a[href*="/tag/"]').first(), page.locator('section.pb-16').first());
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
