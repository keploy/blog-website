import { test, expect } from '@playwright/test';

test.describe('PostBody Component', () => {
    test.beforeEach(async ({ page, baseURL }) => {
        const targetUrl = baseURL
            ? `${baseURL}/technology`
            : 'http://localhost:3000/blog/technology';
        await page.goto(targetUrl);
        await page.waitForLoadState('domcontentloaded');

        const firstPost = page.locator('a[href*="/technology/"]').first();
        await expect(firstPost).toBeVisible({ timeout: 15000 });
        await expect(firstPost).toBeEnabled();
        await firstPost.click();
        await page.waitForLoadState('domcontentloaded');
    });

    test('should display post content area', async ({ page }) => {
        const postBody = page.getByTestId('post-content').first();
        await expect(postBody).toBeVisible({ timeout: 15000 });
    });

    test('should display author card section', async ({ page }) => {
        const authorCard = page.getByTestId('author-card').first();
        await expect(authorCard).toBeVisible({ timeout: 15000 });
    });

    test('should render post content text', async ({ page }) => {
        const postContent = page.getByTestId('post-content');
        await expect(postContent).toBeVisible({ timeout: 15000 });
        const text = await postContent.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
    });

    test('should display Table of Contents on mobile as toggle', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        // TOC renders as a collapsible dropdown on screens < 1440px
        const tocToggle = page.locator('button').filter({ hasText: 'Table of Contents' });
        const tocHeading = page.locator('text=/Table of Contents/i');
        const count = await tocToggle.count() + await tocHeading.count();
        // TOC only appears when there are headings in the post content
        const headingCount = await page.getByTestId('post-content').locator('h2, h3, h4').count();
        if (headingCount > 0) {
            expect(count).toBeGreaterThan(0);
            const hasVisibleToggle = await tocToggle.first().isVisible().catch(() => false);
            const hasVisibleHeading = await tocHeading.first().isVisible().catch(() => false);
            expect(hasVisibleToggle || hasVisibleHeading).toBeTruthy();
        } else {
            expect(count).toBe(0);
        }
    });

    test('should display code blocks if post has code', async ({ page }) => {
        const codeBlocks = page.getByTestId('code-block');
        await expect(codeBlocks.first()).toBeVisible();
    });

    test('should display copy button on code blocks', async ({ page }) => {
        const codeBlocks = page.getByTestId('code-block');
        await expect(codeBlocks.first()).toBeVisible();
        const copyBtn = page.getByTestId('copy-button').first();
        await expect(copyBtn).toBeVisible();
    });

    test('should have a horizontal rule separator', async ({ page }) => {
        const postBody = page.getByTestId('post-content');
        await expect(postBody).toBeVisible({ timeout: 15000 });
        const hr = postBody.locator('hr');
        await expect(hr.first()).toBeVisible();
    });

    test('post content should contain paragraphs or text nodes', async ({ page }) => {
        const postBody = page.getByTestId('post-content');
        await expect(postBody).toBeVisible({ timeout: 15000 });
        const text = await postBody.textContent();
        expect(text?.trim().length).toBeGreaterThan(50);
    });
});
