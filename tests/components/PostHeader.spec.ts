import { test, expect } from '@playwright/test';

test.describe('PostHeader Component', () => {
    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/technology`);
        await page.waitForLoadState('domcontentloaded');

        const firstPost = page.locator('a[href*="/technology/"]').first();
        const href = await firstPost.getAttribute('href');
        if (href) {
            await page.goto(href);
            await page.waitForLoadState('domcontentloaded');
        }
    });

    test('should display a non-empty post title as h1', async ({ page }) => {
        const title = page.locator('h1').first();
        await expect(title).toBeVisible({ timeout: 15000 });
        const text = await title.textContent();
        expect(text?.trim().length).toBeGreaterThan(3);
    });

    test('should display cover image with alt text', async ({ page }) => {
        const coverImg = page.locator('img').first();
        await expect(coverImg).toBeVisible();
        const alt = await coverImg.getAttribute('alt');
        expect(alt).not.toBeNull();
    });

    test('should display post date in a readable format', async ({ page }) => {
        const dateElement = page.locator('time').first();
        await expect(dateElement).toBeVisible();
        const dateText = await dateElement.textContent();
        const hasYear = /\d{4}/.test(dateText || '');
        const hasMonthName = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i.test(dateText || '');
        expect(hasYear || hasMonthName).toBe(true);
    });

    test('should display author information in header', async ({ page }) => {
        const authorSection = page.locator('img[alt*="avatar"]').or(
            page.locator('[class*="author"]')
        );
        const count = await authorSection.count();
        expect(count).toBeGreaterThan(0);
    });
});

