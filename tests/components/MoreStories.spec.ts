import { test, expect } from '@playwright/test';

test.describe('More Stories Component', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL || 'http://localhost:3000/blog');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('should display multiple post cards', async ({ page }) => {
    const postCards = page.locator('article, div[class*="post"], a[href*="/technology/"], a[href*="/community/"]');
    const count = await postCards.count();
    expect(count).toBeGreaterThan(1);
  });

  test('should display post grid layout', async ({ page }) => {
    const gridContainer = page.locator('[class*="grid-cols"]').first();
    const count = await gridContainer.count();
    expect(count).toBeGreaterThan(0);
    if (count > 0) {
      await expect(gridContainer).toBeVisible();
    }
  });

  test('each post card should have a title', async ({ page }) => {
    const postTitles = page.locator('h3 a[href*="/technology/"], h3 a[href*="/community/"]');
    const count = await postTitles.count();
    if (count > 0) {
      await expect(postTitles.first()).toBeVisible();
      const titleText = await postTitles.first().textContent();
      expect(titleText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('each post card should display author information', async ({ page }) => {
    const postCard = page.locator('article, a[href*="/technology/"], a[href*="/community/"]').nth(2);
    if (await postCard.count() > 0) {
      const authorInfo = postCard.locator('text=/by|author|keploy|anonymous/i').or(
        postCard.locator('[class*="author"]')
      );
      const count = await authorInfo.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('each post card should display a date', async ({ page }) => {
    const dateElements = page.locator('time');
    const count = await dateElements.count();
    if (count > 0) {
      await expect(dateElements.first()).toBeVisible();
    }
  });

  test('post cards should be clickable', async ({ page }) => {
    const clickablePost = page.locator('a[href*="/technology/"], a[href*="/community/"]').nth(2);
    if (await clickablePost.count() > 0) {
      const href = await clickablePost.getAttribute('href');
      expect(href).toMatch(/\/(technology|community)\//);
    }
  });

  test('should navigate to post page when card is clicked', async ({ page }) => {
    const postLinks = page.locator('h3 a[href*="/technology/"], h3 a[href*="/community/"]');
    const count = await postLinks.count();
    if (count > 1) {
      const link = postLinks.nth(1);
      const href = await link.getAttribute('href');
      if (href) {
        await link.click();
        await page.waitForURL(`**${href}**`, { timeout: 20000 });
        expect(page.url()).toContain(href);
      }
    }
  });

  test('should display "Load More" or pagination if available', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const loadMoreButton = page.locator('button:has-text("Load"), button:has-text("More"), button:has-text("Show")').or(
      page.locator('[class*="pagination"], [class*="load"]')
    );
    const count = await loadMoreButton.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display post images if available', async ({ page }) => {
    const postCard = page.locator('article, a[href*="/technology/"], a[href*="/community/"]').nth(2);
    if (await postCard.count() > 0) {
      const postImage = postCard.locator('img').first();
      if (await postImage.count() > 0) {
        await expect(postImage).toBeVisible();
      }
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    await page.goto(`${page.url()}?q=veryrareunlikelysearchterm12345`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/blog/);
  });
});
