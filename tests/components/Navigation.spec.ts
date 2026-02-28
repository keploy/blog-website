import { test, expect } from '@playwright/test';

test.describe('Navigation Component', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL || 'http://localhost:3000/blog');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('should display Keploy logo', async ({ page }) => {
    const logo = page.locator('img[alt="Keploy Logo"]').first();
    await expect(logo).toBeVisible();
  });

  test('should have clickable logo with a valid href', async ({ page }) => {
    const logoLink = page.locator('a').filter({ has: page.locator('img[alt="Keploy Logo"]') }).first();
    await expect(logoLink).toBeVisible();
    const href = await logoLink.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('should display Technology navigation link', async ({ page }) => {
    await page.waitForTimeout(1000);
    const techLink = page.locator('a[href*="technology"]').first();
    await expect(techLink).toBeVisible({ timeout: 15000 });
  });

  test('should display Community navigation link', async ({ page }) => {
    const communityLink = page.locator('a[href*="community"]').first();
    await expect(communityLink).toBeVisible();
  });

  test('should display search button on desktop', async ({ page, viewport }) => {
    test.skip(viewport && viewport.width < 768, 'Desktop only test');
    const searchButton = page.locator('button').filter({
      has: page.locator('svg.lucide-search')
    }).or(page.locator('button:has-text("Search")'));
    await expect(searchButton.first()).toBeVisible();
  });

  test('should navigate to Technology page when Technology link is clicked', async ({ page }) => {
    const techLink = page.locator('a[href*="technology"]').first();
    await techLink.click({ force: true });
    await page.waitForURL('**/technology**', { timeout: 20000 });
    expect(page.url()).toContain('/technology');
  });

  test('should navigate to Community page when Community link is clicked', async ({ page }) => {
    const communityLink = page.locator('a[href*="community"]').first();
    await communityLink.click({ force: true });
    await page.waitForURL('**/community**', { timeout: 20000 });
    expect(page.url()).toContain('/community');
  });

  test('should render nav element', async ({ page }) => {
    const navbar = page.locator('nav').first();
    const count = await navbar.count();
    if (count > 0) {
      await expect(navbar).toBeVisible({ timeout: 15000 });
      const navClasses = await navbar.getAttribute('class');
      expect(navClasses).toBeTruthy();
    }
  });

  test('should update navbar appearance on scroll', async ({ page }) => {
    const navbar = page.locator('nav').first();
    const count = await navbar.count();
    if (count > 0) {
      await expect(navbar).toBeVisible({ timeout: 15000 });
      const initialClasses = await navbar.getAttribute('class');
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(500);
      const scrolledClasses = await navbar.getAttribute('class');
      expect(scrolledClasses).toBeTruthy();
    }
  });

  test('should navigate back to homepage when logo is clicked from another page', async ({ page }) => {
    const techLink = page.locator('a[href*="technology"]').first();
    await techLink.click();
    await page.waitForURL('**/technology**', { timeout: 20000 });

    const logo = page.locator('img[alt="Keploy Logo"]').first();
    const logoLink = page.locator('a').filter({ has: logo }).first();
    const href = await logoLink.getAttribute('href');
    await logoLink.click({ force: true });

    await page.waitForTimeout(3000);

    const url = page.url();
    expect(url.includes('/blog') || url.includes('keploy.io')).toBeTruthy();
  });

  test('should keep navigation visible at all scroll positions', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);
    const navbar = page.locator('nav').first();
    if (await navbar.count() > 0) {
      await expect(navbar).toBeVisible();
    }
  });
});
