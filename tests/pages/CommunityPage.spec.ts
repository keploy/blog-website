import { test, expect } from '@playwright/test';

test.describe('Community Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/community`, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load community page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Keploy Blog/);
  });

  test('should render the Navigation component', async ({ page }) => {
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should render the Keploy logo in Navigation', async ({ page }) => {
    const headerLogo = page.locator('header img[alt="Keploy Logo"]').first();
    await expect(headerLogo).toBeVisible();
  });

  test('should render the HeroPost component', async ({ page }) => {
    const heroSection = page.locator('article, section, div').filter({
      has: page.locator('h1, h2, h3')
    }).first();
    await expect(heroSection).toBeVisible();
  });

  test('should render the MoreStories component', async ({ page }) => {
    const storiesSection = page.locator('a[href*="/community/"]').nth(1);
    await expect(storiesSection).toBeVisible();
  });

  test('should render the Footer component', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
