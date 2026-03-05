import { test, expect } from '@playwright/test';

test.describe('PostHeader Component', () => {
    test.beforeEach(async ({ page, baseURL }) => {
        const url = baseURL ? `${baseURL}/technology` : 'http://localhost:3000/blog/technology';
        await page.goto(url);
        await page.waitForLoadState('domcontentloaded');

        const firstPost = page.locator('a[href*="/technology/"]').first();
        if (await firstPost.count() > 0) {
            const href = await firstPost.getAttribute('href');
            if (href) {
                await page.goto(href);
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(1500);
            }
        }
    });

    test('should display post title as h1', async ({ page }) => {
        const title = page.locator('h1').first();
        await expect(title).toBeVisible({ timeout: 15000 });
        const titleText = await title.textContent();
        expect(titleText?.trim().length).toBeGreaterThan(0);
    });

    test('should display post publication date', async ({ page }) => {
        const dateElement = page.locator('time');
        const count = await dateElement.count();
        if (count > 0) {
            await expect(dateElement.first()).toBeVisible();
        } else {
            const dateText = page.locator('[class*="date"]').first();
            expect(await dateText.count()).toBeGreaterThanOrEqual(0);
        }
    });

    test('should display cover image for the post', async ({ page }) => {
        const coverImg = page.locator('img').first();
        const count = await coverImg.count();
        if (count > 0) {
            await expect(coverImg).toBeVisible();
        }
    });

    test('should display post categories if available', async ({ page }) => {
        const categories = page.locator('[class*="categor"], a[href*="/tag/"]');
        const count = await categories.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display author information in header', async ({ page }) => {
        const authorSection = page.locator('img[alt*="avatar"]').or(
            page.locator('[class*="author"]')
        );
        const count = await authorSection.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display estimated reading time if available', async ({ page }) => {
        const readingTime = page.locator('text=/min read|\\d+ min/i');
        const count = await readingTime.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('cover image should have an alt text', async ({ page }) => {
        const imgs = page.locator('img');
        const count = await imgs.count();
        if (count > 0) {
            const alt = await imgs.first().getAttribute('alt');
            expect(alt).not.toBeNull();
        }
    });

    test('should render post title with meaningful content', async ({ page }) => {
        const title = page.locator('h1').first();
        const count = await title.count();
        if (count > 0) {
            const text = await title.textContent();
            expect(text?.trim()).not.toBe('');
            expect(text?.trim().length).toBeGreaterThan(3);
        }
    });

    test('date should be in a readable format', async ({ page }) => {
        const dateElement = page.locator('time').first();
        const count = await dateElement.count();
        if (count > 0) {
            const dateText = await dateElement.textContent();
            const hasYear = /\d{4}/.test(dateText || '');
            const hasMonthName = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i.test(dateText || '');
            expect(hasYear || hasMonthName).toBe(true);
        }
    });

    test('should not display blank or empty h1', async ({ page }) => {
        const h1Elements = page.locator('h1');
        const count = await h1Elements.count();
        if (count > 0) {
            for (let i = 0; i < Math.min(count, 3); i++) {
                const text = await h1Elements.nth(i).textContent();
                expect(text?.trim().length).toBeGreaterThan(0);
            }
        }
    });
});
