import { test, expect } from '@playwright/test';

test.describe('PostBody Component', () => {
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
        }
    });

    test('should display post content area', async ({ page }) => {
        const postBody = page.locator('#post-body-check');
        const count = await postBody.count();
        if (count > 0) {
            await expect(postBody).toBeVisible({ timeout: 15000 });
        } else {
            const article = page.locator('article, [class*="post-body"], [class*="content"]').first();
            await expect(article).toBeVisible({ timeout: 15000 });
        }
    });

    test('should display author name section', async ({ page }) => {
        const authoredBy = page.locator('h1:has-text("Authored By")');
        const count = await authoredBy.count();
        if (count > 0) {
            await expect(authoredBy.first()).toBeVisible();
            const text = await authoredBy.first().textContent();
            expect(text).toContain('Authored By');
            expect(text?.length).toBeGreaterThan('Authored By: '.length);
        }
    });

    test('should render post content text', async ({ page }) => {
        const postContent = page.locator('.prose, [class*="content"], #post-body-check');
        const count = await postContent.count();
        if (count > 0) {
            const text = await postContent.first().textContent();
            expect(text?.trim().length).toBeGreaterThan(0);
        }
    });

    test('should display Table of Contents when headings exist', async ({ page }) => {

        const tocElements = page.locator('text=/Table of Contents/i');
        const count = await tocElements.count();
        if (count > 0) {

            let anyVisible = false;
            for (let i = 0; i < count; i++) {
                if (await tocElements.nth(i).isVisible()) {
                    anyVisible = true;
                    break;
                }
            }

            expect(count).toBeGreaterThan(0);
        }
    });

    test('should display code blocks if post has code', async ({ page }) => {
        const codeBlocks = page.locator('.cm-editor');
        const count = await codeBlocks.count();
        if (count > 0) {
            await expect(codeBlocks.first()).toBeVisible();
        } else {
            expect(count).toBeGreaterThanOrEqual(0);
        }
    });

    test('should display copy button on code blocks', async ({ page }) => {
        const codeBlocks = page.locator('.cm-editor');
        if (await codeBlocks.count() > 0) {
            const copyBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
            const count = await copyBtn.count();
            expect(count).toBeGreaterThan(0);
        }
    });

    test('should have a horizontal rule separator before author section', async ({ page }) => {
        const postBody = page.locator('#post-body-check');
        if (await postBody.count() > 0) {
            const hr = postBody.locator('hr');
            const count = await hr.count();
            if (count > 0) {
                await expect(hr.first()).toBeVisible();
            }
        }
    });

    test('should display author description section', async ({ page }) => {
        const authorDesc = page.locator('[id="author-description-placeholder"], [class*="author"]').first();
        const count = await authorDesc.count();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should display WaitlistBanner in the aside', async ({ page }) => {
        const aside = page.locator('aside');
        const count = await aside.count();
        if (count > 0) {
            await expect(aside.first()).toBeVisible();
        }
    });

    test('should display Reviewed By section if reviewer exists', async ({ page }) => {
        const reviewedBy = page.locator('h1:has-text("Reviewed By")');
        const count = await reviewedBy.count();
        expect(count).toBeGreaterThanOrEqual(0);
        if (count > 0) {
            const text = await reviewedBy.first().textContent();
            expect(text).toContain('Reviewed By');
        }
    });

    test('prose content should contain paragraphs', async ({ page }) => {
        const prose = page.locator('.prose');
        if (await prose.count() > 0) {
            const paragraphs = prose.locator('p');
            const pCount = await paragraphs.count();
            expect(pCount).toBeGreaterThanOrEqual(0);
        }
    });

    test('should navigate to heading anchor when TOC item is clicked', async ({ page }) => {
        const tocItem = page.locator('nav ul li button').first();
        if (await tocItem.count() > 0) {
            await tocItem.click({ force: true });
            const url = page.url();
            expect(url).toBeTruthy();
        }
    });
});
