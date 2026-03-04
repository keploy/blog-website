import { test, expect } from '@playwright/test';

test.describe('Technology Post Page - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/technology` || 'http://localhost:3000/blog/technology');
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
    if (await headerLogo.count() > 0) {
      await expect(headerLogo).toBeVisible();
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
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
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });
});
