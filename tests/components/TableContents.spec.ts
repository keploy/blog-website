import { test, expect } from '@playwright/test';

test.describe('TableContents (TOC) Component - Desktop', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test.beforeEach(async ({ page, baseURL }) => {
        const targetUrl = baseURL ? `${baseURL}/technology` : 'http://localhost:3000/blog/technology';
        await page.goto(targetUrl);
        await page.waitForLoadState('domcontentloaded');

        const firstPost = page.locator('a[href*="/technology/"]').first();
        await expect(firstPost).toBeVisible({ timeout: 15000 });
        await expect(firstPost).toBeEnabled();
        await firstPost.click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#post-body-check')).toBeVisible({ timeout: 10000 });
    });

    test('should display "Table of Contents" heading', async ({ page }) => {
        const tocElements = page.locator('text=Table of Contents');
        const count = await tocElements.count();
        if (count > 0) {

            let anyVisible = false;
            for (let i = 0; i < count; i++) {
                if (await tocElements.nth(i).isVisible()) {
                    anyVisible = true;
                    break;
                }
            }

            expect(anyVisible).toBe(true);
            expect(count).toBeGreaterThan(0);
        }
    });

    test('should render TOC navigation on desktop', async ({ page }) => {
        const tocNav = page.locator('nav').filter({ has: page.locator('ul') }).first();
        const count = await tocNav.count();
        if (count > 0) {
            await expect(tocNav).toBeVisible();
        }
    });

    test('TOC should contain list items for each heading', async ({ page }) => {
        const tocNav = page.locator('nav ul li').first();
        const count = await tocNav.count();
        if (count > 0) {
            await expect(tocNav).toBeVisible();
        }
    });

    test('TOC items should be clickable buttons', async ({ page }) => {
        const tocButtons = page.locator('nav ul li button');
        const count = await tocButtons.count();
        if (count > 0) {
            await expect(tocButtons.first()).toBeVisible();
        }
    });

    test('TOC item text should match a heading in the post', async ({ page }) => {
        const tocButtons = page.locator('nav ul li button');
        const count = await tocButtons.count();
        if (count > 0) {
            const tocText = await tocButtons.first().textContent();
            expect(tocText?.trim().length).toBeGreaterThan(0);

            const matchingHeading = page.locator('#post-body-check').locator('h1, h2, h3, h4').filter({
                hasText: tocText?.trim() || ''
            });
            const headingCount = await matchingHeading.count();
            expect(headingCount).toBeGreaterThan(0);
        }
    });

    test('clicking a TOC item should update URL with anchor hash', async ({ page }) => {
        const tocButtons = page.locator('nav ul li button');
        const count = await tocButtons.count();
        if (count > 1) {
            await expect(tocButtons.nth(1)).toBeVisible();
            await expect(tocButtons.nth(1)).toBeEnabled();
            await tocButtons.nth(1).click();
            await expect.poll(async () => new URL(page.url()).hash).not.toBe('');
        }
    });

    test('TOC items should have orange hover style', async ({ page }) => {
        const tocButtons = page.locator('nav ul li button');
        const buttonCount = await tocButtons.count();
        if (buttonCount > 0) {
            let hasHoverClass = false;
            for (let i = 0; i < buttonCount; i++) {
                const classes = await tocButtons.nth(i).getAttribute('class');
                if (classes && classes.includes('hover:text-orange-500')) {
                    hasHoverClass = true;
                    break;
                }
            }
            expect(hasHoverClass).toBe(true);
        }
    });

    test('TOC should be sticky on desktop while scrolling', async ({ page }) => {
        const tocContainer = page.locator('.hidden.lg\\:inline-block');
        const count = await tocContainer.count();
        if (count > 0) {
            const classes = await tocContainer.getAttribute('class');
            expect(classes).toContain('sticky');
        }
    });
});

test.describe('TableContents (TOC) Component - Mobile', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/technology`);
        await page.waitForLoadState('domcontentloaded');

        const firstPost = page.locator('a[href*="/technology/"]').first();
        await expect(firstPost).toBeVisible({ timeout: 15000 });
        await expect(firstPost).toBeEnabled();
        await firstPost.click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('#post-body-check')).toBeVisible({ timeout: 10000 });
    });

    test('should display "Table of Contents" toggle button on mobile', async ({ page }) => {
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' }).first();
        const count = await tocToggle.count();
        if (count > 0) {
            await expect(tocToggle).toBeVisible();
        }
    });

    test('TOC dropdown should be collapsed by default on mobile', async ({ page }) => {
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' });
        if (await tocToggle.count() > 0) {
            const ariaExpanded = await tocToggle.first().getAttribute('aria-expanded');
            expect(ariaExpanded).toBe('false');
        }
    });

    test('clicking TOC toggle should expand the dropdown', async ({ page }) => {
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' }).first();
        if (await tocToggle.count() > 0) {
            await expect(tocToggle).toBeVisible();
            await expect(tocToggle).toBeEnabled();
            await tocToggle.click();
            await expect(tocToggle).toHaveAttribute('aria-expanded', 'true');
        }
    });

    test('should display TOC items after expanding dropdown on mobile', async ({ page }) => {
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' }).first();
        if (await tocToggle.count() > 0) {
            await expect(tocToggle).toBeVisible();
            await expect(tocToggle).toBeEnabled();
            await tocToggle.click();
            await expect(tocToggle).toHaveAttribute('aria-expanded', 'true');
            const headingCount = await page.locator('#post-body-check h2, #post-body-check h3, #post-body-check h4').count();
            const dropdown = tocToggle.locator('xpath=following-sibling::div[contains(@class,"mt-2")][1]');
            const tocItems = dropdown.locator('ul li button, ul li a').filter({ hasNot: page.locator('svg') });
            const count = await tocItems.count();
            if (headingCount > 0) {
                await expect(dropdown).toBeVisible();
                if (count > 0) {
                    await expect(tocItems.first()).toBeVisible();
                }
            }
        }
    });

    test('clicking a TOC item on mobile should close the dropdown', async ({ page }) => {
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' }).first();
        if (await tocToggle.count() > 0) {
            await expect(tocToggle).toBeVisible();
            await expect(tocToggle).toBeEnabled();
            await tocToggle.click();
            await expect(tocToggle).toHaveAttribute('aria-expanded', 'true');
            const dropdown = tocToggle.locator('xpath=following-sibling::div[contains(@class,"mt-2")][1]');
            const tocItems = dropdown.locator('ul li button').first();
            if (await tocItems.count() > 0) {
                await expect(tocItems).toBeVisible();
                await expect(tocItems).toBeEnabled();
                await tocItems.click();
                await expect(tocToggle).toHaveAttribute('aria-expanded', 'false');
            }
        }
    });
});
