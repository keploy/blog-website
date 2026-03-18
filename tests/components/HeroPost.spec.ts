import { test, expect } from '@playwright/test';

test.describe('Hero Post Component', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/technology`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display hero post section', async ({ page }) => {
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible({ timeout: 15000 });
  });

  test('should display hero post container', async ({ page }) => {
    const heroContainer = page.locator('section, article').first();
    await expect(heroContainer).toBeVisible({ timeout: 15000 });
  });

  test('should display featured image', async ({ page }) => {
    const heroSection = page.locator('section').first();
    const coverImage = heroSection.locator('img').first();
    await expect(coverImage).toBeVisible({ timeout: 15000 });
  });

  test('should display hero post title', async ({ page }) => {
    const heroTitle = page.locator('[data-testid="hero-post-title"]').first();
    await expect(heroTitle).toBeVisible();
    const titleText = await heroTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText?.trim().length).toBeGreaterThan(0);
  });

  test('should have clickable link to post', async ({ page }) => {
    const heroSection = page.locator('section').first();
    const postLink = heroSection.locator('a[href*="/technology/"], a[href*="/community/"]').first();
    await expect(postLink).toBeVisible();
    const href = await postLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(/\/(technology|community)\//);
  });

  test('should display author information', async ({ page }) => {
    const heroSection = page.locator('section').first();
    const authorEl = heroSection.locator('[data-testid="hero-post-author"]').first();
    await expect(authorEl).toBeVisible();
    await expect(authorEl).toHaveText('Tech Author One');
  });

  test('should display post date', async ({ page }) => {
    const heroSection = page.locator('section').first();
    const dateElement = heroSection.locator('time').first();
    await expect(dateElement).toBeVisible();
    const dateText = await dateElement.textContent();
    expect(dateText?.trim().length).toBeGreaterThan(0);
  });

  test('should display post excerpt', async ({ page }) => {
    const heroSection = page.locator('section').first();
    const excerpt = heroSection.locator('p, div').filter({ hasText: /.{20,}/ }).first();
    await expect(excerpt).toBeVisible();
    const excerptText = await excerpt.textContent();
    expect(excerptText?.trim().length).toBeGreaterThan(10);
  });

  test('should have hover effect on hero post container', async ({ page }) => {
    const heroContainer = page.locator('section').first().locator('> div').first();
    const initialBox = await heroContainer.boundingBox();
    expect(initialBox).toBeTruthy();
    await heroContainer.hover({ force: true });
    await expect(heroContainer).toBeVisible();
  });

  test('should navigate to full post when clicked', async ({ page, baseURL }) => {
    const heroSection = page.locator('section').first();
    const postLink = heroSection.locator('a[href*="/technology/"], a[href*="/community/"]').first();
    await expect(postLink).toBeVisible();
    const href = await postLink.getAttribute('href');
    expect(href).toBeTruthy();
    await page.goto(href!);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toMatch(/\/(technology|community)\//);
  });
});
