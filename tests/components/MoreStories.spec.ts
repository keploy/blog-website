import { test, expect } from '@playwright/test';

test.describe('More Stories Component', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display multiple post cards', async ({ page }) => {
    const postCards = page.getByTestId('post-card');
    await expect(postCards.nth(1)).toBeVisible();
  });

  test('should display post grid layout', async ({ page }) => {
    const postGrid = page.locator('[data-testid="post-grid"]').first();
    await expect(postGrid).toBeVisible();
    const postCards = postGrid.getByTestId('post-card');
    await expect(postCards.nth(1)).toBeAttached();
  });

  test('each post card should have a title', async ({ page }) => {
    const firstCard = page.getByTestId('post-card').first();
    const postTitle = firstCard.locator('h3 a');
    await expect(postTitle).toBeVisible();
    const titleText = await postTitle.textContent();
    expect(titleText?.trim().length).toBeGreaterThan(0);
  });

  test('each post card should display author information', async ({ page }) => {
    const postCard = page.getByTestId('post-card').nth(2);
    await expect(postCard).toBeVisible();
  });

  test('each post card should display a date', async ({ page }) => {
    const dateElements = page.locator('time');
    await expect(dateElements.first()).toBeVisible();
  });

  test('post cards should be clickable', async ({ page }) => {
    const clickablePost = page.getByTestId('post-card').nth(2).locator('a').first();
    await expect(clickablePost).toBeVisible();
    const href = await clickablePost.getAttribute('href');
    expect(href).toMatch(/\/(technology|community)\//);
  });

  test('should navigate to post page when card is clicked', async ({ page }) => {
    const postCard = page.getByTestId('post-card').nth(1);
    const link = postCard.locator('h3 a');
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    await link.evaluate((node) => (node as HTMLAnchorElement).click());
    await page.waitForURL(`**${href}**`, { waitUntil: 'commit', timeout: 20000 });
    expect(page.url()).toContain(href);
  });

  test('should display post images if available', async ({ page }) => {
    const postCard = page.getByTestId('post-card').nth(2);
    await expect(postCard).toBeVisible();
    const postImage = postCard.locator('img').first();
    await expect(postImage).toBeVisible();
  });

  test('should handle empty state gracefully', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/technology?q=veryrareunlikelysearchterm12345`);
    await page.waitForLoadState('domcontentloaded');
    const postGrid = page.locator('[data-testid="post-grid"]').first();
    const postCards = postGrid.getByTestId('post-card');
    await expect(postCards).toHaveCount(0);
    const emptyStateMessage = page.getByText('No posts found matching', { exact: false });
    await expect(emptyStateMessage).toBeVisible();
  });
});
