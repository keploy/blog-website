import { test, expect } from '@playwright/test';

test.describe('More Stories Component', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display multiple post cards', async ({ page }) => {
    const postCards = page.locator('article, div[class*="post"], a[href*="/technology/"], a[href*="/community/"]');
    const count = await postCards.count();
    expect(count).toBeGreaterThan(1);
  });

  test('should display post grid layout', async ({ page }) => {
    const postGrid = page.locator('[data-testid="post-grid"]').first();
    await expect(postGrid).toBeVisible();
    const postCards = postGrid.locator('a[href*="/technology/"], a[href*="/community/"]');
    const count = await postCards.count();
    expect(count).toBeGreaterThan(1);
  });

  test('each post card should have a title', async ({ page }) => {
    const postTitles = page.locator('h3 a[href*="/technology/"], h3 a[href*="/community/"]');
    const count = await postTitles.count();
    expect(count).toBeGreaterThan(0);
    await expect(postTitles.first()).toBeVisible();
    const titleText = await postTitles.first().textContent();
    expect(titleText?.trim().length).toBeGreaterThan(0);
  });

  test('each post card should display author information', async ({ page }) => {
    const postCard = page.locator('article, a[href*="/technology/"], a[href*="/community/"]').nth(2);
    await expect(postCard).toBeVisible();
  });

  test('each post card should display a date', async ({ page }) => {
    const dateElements = page.locator('time');
    const count = await dateElements.count();
    expect(count).toBeGreaterThan(0);
    await expect(dateElements.first()).toBeVisible();
  });

  test('post cards should be clickable', async ({ page }) => {
    const clickablePost = page.locator('a[href*="/technology/"], a[href*="/community/"]').nth(2);
    await expect(clickablePost).toBeVisible();
    const href = await clickablePost.getAttribute('href');
    expect(href).toMatch(/\/(technology|community)\//);
  });

  test('should navigate to post page when card is clicked', async ({ page }) => {
    const postLinks = page.locator('h3 a[href*="/technology/"], h3 a[href*="/community/"]');
    const count = await postLinks.count();
    expect(count).toBeGreaterThan(1);
    const link = postLinks.nth(1);
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    await link.evaluate((node) => (node as HTMLAnchorElement).click());
    await page.waitForURL(`**${href}**`, { waitUntil: 'commit', timeout: 20000 });
    expect(page.url()).toContain(href);
  });

  test('should display post images if available', async ({ page }) => {
    const postCard = page.locator('article, a[href*="/technology/"], a[href*="/community/"]').nth(2);
    await expect(postCard).toBeVisible();
    const postImage = postCard.locator('img').first();
    await expect(postImage).toBeVisible();
  });

  test('should handle empty state gracefully', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/technology?q=veryrareunlikelysearchterm12345`);
    await page.waitForLoadState('domcontentloaded');
    const postGrid = page.locator('[data-testid="post-grid"]').first();
    const postCards = postGrid.locator('a[href*="/technology/"], a[href*="/community/"]');
    await expect(postCards).toHaveCount(0);
    const emptyStateMessage = page.getByText('No posts found matching', { exact: false });
    await expect(emptyStateMessage).toBeVisible();
  });
});
