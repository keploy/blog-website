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
        const tagsHeading = tagsSection.locator('h3');
        await expect(tagsHeading).toBeVisible();
        const text = await tagsHeading.textContent();
        expect(text?.trim().toLowerCase()).toBe('tags');
    });

    test('should display tag buttons when tags exist', async ({ page }) => {
        const tagLinks = page.getByTestId('tag-link');
        await expect(tagLinks.first()).toBeVisible();
    });

    test('each tag should have non-empty text', async ({ page }) => {
        const tagLinks = page.getByTestId('tag-link');
        const firstTagText = await tagLinks.first().textContent();
        expect(firstTagText?.trim().length).toBeGreaterThan(0);
    });

    test('tag buttons should link to correct tag detail page', async ({ page }) => {
        const tagLinks = page.getByTestId('tag-link');
        const href = await tagLinks.first().getAttribute('href');
        expect(href).toMatch(/\/tag\/.+/);
    });

    test('tag buttons should have aria-label for accessibility', async ({ page }) => {
        const tagLinks = page.getByTestId('tag-link');
        const tagButton = tagLinks.first().locator('button');
        const ariaLabel = await tagButton.getAttribute('aria-label');
        expect(ariaLabel).toMatch(/View posts tagged with/i);
    });

    test('should navigate to tag detail page when tag is clicked', async ({ page }) => {
        const tagLinks = page.getByTestId('tag-link');
        const href = await tagLinks.first().getAttribute('href');
        expect(href).toBeTruthy();
        const tagPathMatch = href!.match(/\/tag\/[^/?#]+/);
        
        await tagLinks.first().click();
        
        if (tagPathMatch) {
            await page.waitForURL(`**${tagPathMatch[0]}**`, { timeout: 20000 });
        } else {
            await page.waitForURL(`**/tag/**`, { timeout: 20000 });
        }
        expect(page.url()).toContain('/tag/');
    });
});
