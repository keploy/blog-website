import { test, expect } from '@playwright/test';

test.describe('Testimonials Component - Homepage', () => {
    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL!);
        await page.waitForLoadState('domcontentloaded');

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 1.5));
    });

    test('should display "What our community thinks" heading', async ({ page }) => {
        const heading = page.locator('h3:has-text("What our community thinks")');
        await expect(heading).toBeVisible();
    });

    test('should display marquee container', async ({ page }) => {
        const marqueeContainer = page.locator('.marquee-mask');
        await expect(marqueeContainer.first()).toBeVisible();
    });

    test('should display testimonial review cards', async ({ page }) => {
        const figures = page.locator('.marquee-mask figure');
        await expect(figures.first()).toBeVisible();
    });

    test('review cards should contain an avatar, name, and ID', async ({ page }) => {
        const firstFigure = page.locator('.marquee-mask figure').first();

        const avatar = firstFigure.locator('img');
        const name = firstFigure.locator('figcaption');
        const id = firstFigure.locator('p');

        await expect(avatar).toBeVisible();
        await expect(name).toBeVisible();
        await expect(id).toBeVisible();
    });

    test('review cards should contain a blockquote review text', async ({ page }) => {
        const firstFigure = page.locator('.marquee-mask figure').first();
        const blockquote = firstFigure.locator('blockquote');
        await expect(blockquote).toBeVisible();

        const text = await blockquote.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
    });

    test('review cards should link to the original post/tweet', async ({ page }) => {
        const firstReviewLink = page.locator('.marquee-mask a').first();
        await expect(firstReviewLink).toBeVisible();

        const href = await firstReviewLink.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href?.startsWith('http') || href?.startsWith('https')).toBe(true);

        const rel = await firstReviewLink.getAttribute('rel');
        expect(rel).toContain('noopener');
        expect(rel).toContain('noreferrer');

        const target = await firstReviewLink.getAttribute('target');
        expect(target).toBe('_blank');
    });

    test('avatar images should have alt text identifying the user', async ({ page }) => {
        const firstAvatar = page.locator('.marquee-mask figure img').first();
        const altText = await firstAvatar.getAttribute('alt');
        expect(altText).toContain('avatar');
    });
});
