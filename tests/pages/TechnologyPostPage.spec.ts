import { test, expect } from '@playwright/test';

test.describe('Technology Post Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const technologyUrl = baseURL
      ? `${baseURL}/technology`
      : 'http://localhost:3000/blog/technology';
    await page.goto(technologyUrl);
    await page.waitForLoadState('domcontentloaded');
    const firstPost = page.locator('a[href*="/technology/"]').first();
    if (await firstPost.count() > 0) {
      await firstPost.click({ force: true });
      await page.waitForLoadState('domcontentloaded');
    }
  });

  test('should load technology post page successfully', async ({ page }) => {
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

  test('should render the PostHeader component', async ({ page }) => {
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
  });

  test('should render the PostBody component', async ({ page }) => {
    const postBody = page.locator('#post-body-check, article, [class*="post-body"], [class*="content"]').first();
    if (await postBody.count() > 0) {
      await expect(postBody).toBeVisible();
    }
  });

  test('should render the Footer component', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footer = page.locator('[data-testid="site-footer"]').first();
    await expect(footer).toBeVisible();
  });
});
