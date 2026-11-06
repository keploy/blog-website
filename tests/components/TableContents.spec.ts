import { test, expect } from '@playwright/test';

test.describe('TableContents (TOC) Component - Desktop', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test.beforeEach(async ({ page, baseURL }) => {
        const targetUrl = baseURL ? `${baseURL}/technology` : 'http://localhost:3000/blog/technology';
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h2').filter({ hasText: /More Stories/i })).toBeVisible({ timeout: 15000 });


        const firstPost = page.locator('[data-testid="hero-post-title"] a, [data-testid="post-card"] a').first();
        await expect(firstPost).toBeVisible({ timeout: 15000 });
        await expect(firstPost).toBeEnabled();
        await firstPost.click();
        await expect(page.getByTestId('post-content')).toBeVisible({ timeout: 15000 });
        const tocItem = page.getByTestId('toc-nav').filter({ visible: true }).locator('[data-toc-id] button').first();
        await expect(tocItem).toBeVisible({ timeout: 10000 });
    });

    test('should display "Table of Contents" heading', async ({ page }) => {
        const tocElements = page.locator('text=Table of Contents').filter({ visible: true });
        await expect(tocElements.first()).toBeVisible();
    });

    test('should render TOC navigation on desktop', async ({ page }) => {
        const tocNav = page.getByTestId('toc-nav').filter({ visible: true }).first();
        await expect(tocNav).toBeVisible();
    });

    test('TOC should contain list items for each heading', async ({ page }) => {
        const tocItem = page.getByTestId('toc-nav').filter({ visible: true }).locator('[data-toc-id]').first();
        await expect(tocItem).toBeVisible();
    });

    test('TOC items should be clickable buttons', async ({ page }) => {
        const tocButtons = page.getByTestId('toc-nav').filter({ visible: true }).locator('[data-toc-id] button');
        await expect(tocButtons.first()).toBeVisible();
    });

    test('TOC item text should match a heading in the post', async ({ page }) => {
        const tocButtons = page.getByTestId('toc-nav').filter({ visible: true }).locator('[data-toc-id] button');
        const tocText = (await tocButtons.first().textContent() || '').trim().replace(/^●\s*/, '');
        expect(tocText.length).toBeGreaterThan(0);

        const matchingHeading = page.getByTestId('post-content').locator('h1, h2, h3, h4').filter({
            hasText: tocText
        });
        const headingCount = await matchingHeading.count();
        expect(headingCount).toBeGreaterThan(0);
    });

    test('clicking a TOC item should update URL with anchor hash', async ({ page }) => {
        const tocButtons = page.getByTestId('toc-nav').filter({ visible: true }).locator('[data-toc-id] button');
        await expect(tocButtons.nth(1)).toBeVisible();
        await expect(tocButtons.nth(1)).toBeEnabled();
        await tocButtons.nth(1).click();
        await expect.poll(async () => new URL(page.url()).hash).not.toBe('');
    });

    test('TOC items should have orange hover style', async ({ page }) => {
        const tocButtons = page.getByTestId('toc-nav').filter({ visible: true }).locator('[data-toc-id] button');
        await expect(tocButtons.first()).toBeVisible();
        // Check first item for active OR hover class
        await expect(tocButtons.first()).toHaveClass(/(!text-orange-500|hover:text-orange-500)/);
    });

    test('TOC should be sticky on desktop while scrolling', async ({ page }) => {
        // Select the parent container that has the 'sticky' class and contains our TOC
        const tocContainer = page.locator('div.sticky').filter({ has: page.getByTestId('toc-nav').filter({ visible: true }) }).first();
        await expect(tocContainer).toHaveClass(/sticky/);
    });
});

test.describe('TableContents (TOC) Component - Mobile', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page, baseURL }) => {
        const targetUrl = baseURL ? `${baseURL}/technology` : 'http://localhost:3000/blog/technology';
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

        await expect(page.locator('h2').filter({ hasText: /More Stories/i })).toBeVisible({ timeout: 15000 });

        const firstPost = page.locator('[data-testid="hero-post-title"] a, [data-testid="post-card"] a').first();
        await expect(firstPost).toBeVisible({ timeout: 15000 });
        await expect(firstPost).toBeEnabled();
        await firstPost.click();

        await expect(page.getByTestId('post-content')).toBeVisible({ timeout: 15000 });
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' }).first();
        await expect(tocToggle).toBeVisible({ timeout: 10000 });
    });

    test('should display "Table of Contents" toggle button on mobile', async ({ page }) => {
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' }).first();
        await expect(tocToggle).toBeVisible();
    });

    test('TOC dropdown should be collapsed by default on mobile', async ({ page }) => {
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' }).first();
        const ariaExpanded = await tocToggle.getAttribute('aria-expanded');
        expect(ariaExpanded).toBe('false');
    });

    test('clicking TOC toggle should expand the dropdown', async ({ page }) => {
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' }).first();
        await expect(tocToggle).toBeVisible();
        await expect(tocToggle).toBeEnabled();
        await tocToggle.click();
        await expect(tocToggle).toHaveAttribute('aria-expanded', 'true');
    });

    test('should display TOC items after expanding dropdown on mobile', async ({ page }) => {
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' }).first();
        await expect(tocToggle).toBeVisible();
        await tocToggle.click();
        await expect(tocToggle).toHaveAttribute('aria-expanded', 'true');
        
        const dropdown = tocToggle.locator('xpath=following-sibling::div').first();
        const firstTOCButton = dropdown.locator('button').filter({ hasNot: page.locator('svg') }).first();
        await expect(dropdown).toBeVisible();
        await expect(firstTOCButton).toBeVisible();
    });

    test('clicking a TOC item on mobile should close the dropdown', async ({ page }) => {
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' }).first();
        await expect(tocToggle).toBeVisible();
        await expect(tocToggle).toBeEnabled();
        await tocToggle.click();
        await expect(tocToggle).toHaveAttribute('aria-expanded', 'true');
        const dropdown = tocToggle.locator('xpath=following-sibling::div').first();
        const tocItems = dropdown.locator('button').first();
        await expect(tocItems).toBeVisible();
        await expect(tocItems).toBeEnabled();
        await tocItems.click();
        await expect(tocToggle).toHaveAttribute('aria-expanded', 'false');
    });
});
