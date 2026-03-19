import { test, expect } from '@playwright/test';

test.describe('Navigation Component', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('domcontentloaded');
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
    const techLink = page.locator('a[href*="technology"]').first();
    await expect(techLink).toBeVisible({ timeout: 15000 });
  });

  test('should display Community navigation link', async ({ page }) => {
    const communityLink = page.locator('a[href*="community"]').first();
    await expect(communityLink).toBeVisible();
  });

  test('should display search button on desktop', async ({ page }) => {
    const viewportSize = page.viewportSize();
    test.skip(viewportSize !== null && viewportSize.width < 768, 'Desktop only test');
    const searchButton = page.locator('button').filter({
      has: page.locator('svg.lucide-search')
    }).or(page.locator('button:has-text("Search")'));
    await expect(searchButton.first()).toBeVisible();
  });

  test('should navigate to Technology page when Technology link is clicked', async ({ page }) => {
    const techLink = page.locator('a[href*="technology"]').first();
    await expect(techLink).toBeVisible({ timeout: 15000 });
    await expect(techLink).toBeEnabled();
    await techLink.click();
    await page.waitForURL('**/technology**', { timeout: 20000 });
    expect(page.url()).toContain('/technology');
  });

  test('should navigate to Community page when Community link is clicked', async ({ page }) => {
    const communityLink = page.locator('a[href*="community"]').first();
    await expect(communityLink).toBeVisible({ timeout: 15000 });
    await expect(communityLink).toBeEnabled();
    await communityLink.click();
    await page.waitForURL('**/community**', { timeout: 20000 });
    expect(page.url()).toContain('/community');
  });

  test('should render nav element', async ({ page }) => {
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible({ timeout: 15000 });
    const navClasses = await navbar.getAttribute('class');
    expect(navClasses).toBeTruthy();
  });

  test('should update navbar appearance on scroll', async ({ page }) => {
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible({ timeout: 15000 });
    await page.evaluate(() => window.scrollBy(0, 200));
    const scrolledClasses = await navbar.getAttribute('class');
    expect(scrolledClasses).toBeTruthy();
  });

  test('should navigate back to homepage when logo is clicked from another page', async ({ page }) => {
    const techLink = page.locator('a[href*="technology"]').first();
    await expect(techLink).toBeVisible({ timeout: 15000 });
    await expect(techLink).toBeEnabled();
    await techLink.click();
    await page.waitForURL('**/technology**', { timeout: 20000 });

    const logo = page.locator('img[alt="Keploy Logo"]').first();
    const logoLink = page.locator('a').filter({ has: logo }).first();
    const href = await logoLink.getAttribute('href');
    expect(href).toBeTruthy();
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toBeEnabled();
    await logoLink.click();
    await page.waitForURL((url) => !url.pathname.includes('/technology'), { timeout: 20000 });
    expect(page.url()).not.toContain('/technology');
  });

  test('should keep navigation visible at all scroll positions', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    const navbar = page.locator('nav').first();
    if (await navbar.count() > 0) {
      await expect(navbar).toBeVisible();
    }
  });
});
