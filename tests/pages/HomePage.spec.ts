import { test, expect } from '@playwright/test';

test.describe('Homepage - Component Availability', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL || 'http://localhost:3000/blog');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Keploy Blog/);
  });

  test('should display navigation with logo', async ({ page }) => {
    const headerLogo = page.locator('header img[alt="Keploy Logo"]').first();
    await expect(headerLogo).toBeVisible();
  });

  test('should display navigation links', async ({ page }) => {
    const techLink = page.locator('a[href*="technology"]').first();
    await expect(techLink).toBeVisible();
    const communityLink = page.locator('a[href*="community"]').first();
    await expect(communityLink).toBeVisible();
  });

  test('should display hero/intro section', async ({ page }) => {
    const mainContent = page.locator('main').or(page.locator('article')).first();
    await expect(mainContent).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should display footer links', async ({ page }) => {
    const footer = page.locator('footer');
    const footerLinks = footer.locator('a');
    await expect(footerLinks.first()).toBeVisible();
  });

  test('should display footer social links', async ({ page }) => {
    const footer = page.locator('footer');
    const socialLinks = footer.locator('a[href*="github.com"], a[href*="twitter.com"], a[href*="linkedin.com"], a[href*="slack.com"]');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have search functionality available', async ({ page, viewport }) => {
    test.skip(viewport && viewport.width < 768, 'Desktop only test');
    const searchButton = page.locator('button').filter({
      has: page.locator('svg.lucide-search')
    }).or(page.locator('button').filter({ hasText: /search/i }));

    await expect(searchButton.first()).toBeVisible();
  });

  test('should display content posts/stories section', async ({ page }) => {
    const posts = page.locator('article, div[class*="post"], a[href*="/technology/"], a[href*="/community/"]').first();
    await expect(posts).toBeVisible();
  });

  test('should have working navigation to technology page', async ({ page, baseURL }) => {
    const techLink = page.locator('a[href*="technology"]').first();
    await techLink.click({ force: true });

    await page.waitForURL(/.*\/technology$/);
    expect(page.url()).toContain('/technology');
  });

  test('should have working navigation to community page', async ({ page, baseURL }) => {
    const communityLink = page.locator('a[href*="community"]').first();
    await communityLink.click({ force: true });

    await page.waitForURL(/.*\/community$/);
    expect(page.url()).toContain('/community');
  });

  test('should support keyboard navigation', async ({ page, browserName }) => {
    await page.locator('body').click({ force: true, position: { x: 0, y: 0 } });
    await page.keyboard.press('Tab');

    if (browserName === 'webkit') {
      await page.waitForTimeout(500);
    }

    const focusedElement = page.locator(':focus').first();
    await expect(focusedElement).toBeAttached();
  });
});
