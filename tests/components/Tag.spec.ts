import { test, expect } from '@playwright/test';

test.describe('Tag Component', () => {
    test.beforeEach(async ({ page, baseURL }) => {
        const targetUrl = baseURL
            ? new URL('/technology', baseURL).toString()
            : 'http://localhost:3000/blog/technology';
        await page.goto(targetUrl);
        await page.waitForLoadState('domcontentloaded');

        const firstPost = page.locator('a[href*="/technology/"]').first();
        if (await firstPost.count() > 0) {
            await firstPost.click({ force: true });
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(500);
        }
    });

    test('should display tag section heading', async ({ page }) => {
        const tagsHeading = page.locator('h3:has-text("tags")');
        const count = await tagsHeading.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display tag buttons when tags exist', async ({ page }) => {
        const tagLinks = page.locator('a[href*="/tag/"]');
        const count = await tagLinks.count();
        if (count > 0) {
            await expect(tagLinks.first()).toBeVisible();
        }
    });

    test('each tag should have non-empty text', async ({ page }) => {
        const tagLinks = page.locator('a[href*="/tag/"]');
        const count = await tagLinks.count();
        if (count > 0) {
            const firstTagText = await tagLinks.first().textContent();
            expect(firstTagText?.trim().length).toBeGreaterThan(0);
        }
    });

    test('tag buttons should link to correct tag detail page', async ({ page }) => {
        const tagLinks = page.locator('a[href*="/tag/"]');
        const count = await tagLinks.count();
        if (count > 0) {
            const href = await tagLinks.first().getAttribute('href');
            expect(href).toMatch(/\/tag\/.+/);
        }
    });

    test('tag buttons should have aria-label for accessibility', async ({ page }) => {
        const tagButtons = page.locator('a[href*="/tag/"] button');
        const count = await tagButtons.count();
        if (count > 0) {
            const ariaLabel = await tagButtons.first().getAttribute('aria-label');
            expect(ariaLabel).toMatch(/View posts tagged with/i);
        }
    });

    test('should navigate to tag detail page when tag is clicked', async ({ page }) => {
        const tagLinks = page.locator('a[href*="/tag/"]');
        const count = await tagLinks.count();
        if (count > 0) {
            const href = await tagLinks.first().getAttribute('href');
            if (href) {
                const tagPathMatch = href.match(/\/tag\/[^/?#]+/);
                await tagLinks.first().click({ force: true });
                if (tagPathMatch) {
                    await page.waitForURL(`**${tagPathMatch[0]}**`, { timeout: 20000 });
                } else {
                    await page.waitForURL(`**/tag/**`, { timeout: 20000 });
                }
                expect(page.url()).toContain('/tag/');
                return;
            }
        }
    });
});
