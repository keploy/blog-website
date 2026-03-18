import { test, expect } from '@playwright/test';

test.describe('Tag Component', () => {
    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/technology`, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const firstPost = page.locator('a[href*="/technology/"]').first();
        await expect(firstPost).toBeVisible({ timeout: 15000 });
        await expect(firstPost).toBeEnabled();
        await firstPost.click();
        await page.waitForLoadState('domcontentloaded');
    });

    test('should display tag section heading', async ({ page }) => {
        const tagsSection = page.locator('[data-testid="tags-section"]');
        if (await tagsSection.count() > 0) {
            const tagsHeading = tagsSection.locator('h3');
            await expect(tagsHeading).toBeVisible();
            const text = await tagsHeading.textContent();
            expect(text?.trim().toLowerCase()).toBe('tags');
        }
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
            expect(href).toBeTruthy();
            const tagPathMatch = href!.match(/\/tag\/[^/?#]+/);
            await expect(tagLinks.first()).toBeVisible();
            await expect(tagLinks.first()).toBeEnabled();
            await tagLinks.first().click();
            if (tagPathMatch) {
                await page.waitForURL(`**${tagPathMatch[0]}**`, { timeout: 20000 });
            } else {
                await page.waitForURL(`**/tag/**`, { timeout: 20000 });
            }
            expect(page.url()).toContain('/tag/');
        }
    });
});
