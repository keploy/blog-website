import { test, expect } from '@playwright/test';

test.describe('Community Post Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    const communityUrl = baseURL ? `${baseURL}/community` : 'http://localhost:3000/blog/community';
    await page.goto(communityUrl, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h2').filter({ hasText: /More Stories/i })).toBeVisible({ timeout: 15000 });

    const firstPost = page.locator('[data-testid="hero-post-title"] a, [data-testid="post-card"] a').first();
    await expect(firstPost).toBeVisible({ timeout: 15000 });
    await expect(firstPost).toBeEnabled();
    await firstPost.click();
    await expect(page.getByTestId('post-content')).toBeVisible({ timeout: 15000 });
  });

  test('should load community post page successfully', async ({ page }) => {
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
      await expect(postBody).toBeVisible();
  });

  test('should render the Footer component', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator('[data-testid="site-footer"]').first();
    await expect(footer).toBeVisible();
  });
});
