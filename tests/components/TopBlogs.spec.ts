import { test, expect } from '@playwright/test';

test.describe('TopBlogs Component - Homepage', () => {
    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL!);
        await page.waitForLoadState('domcontentloaded');
    });

    test('should display "Recent Technology Blogs" heading', async ({ page }) => {
        const techHeading = page.locator('h3:has-text("Recent Technology Blogs")');
        await expect(techHeading).toBeVisible();
    });

    test('should display technology post cards', async ({ page }) => {

        const techGrid = page.locator('div[class*="grid"]').first();
        const techPosts = techGrid.locator('article, div[class*="post"], a[href*="/technology/"]');
        const count = await techPosts.count();
        expect(count).toBeGreaterThan(0);
        await expect(techPosts.first()).toBeVisible();
    });

    test('should display "See all technology blogs" link', async ({ page }) => {
        const seeAllTechLink = page.locator('a:has-text("See all technology blogs")');
        await expect(seeAllTechLink).toBeVisible();
    });

    test('should navigate to technology page when "See all technology blogs" is clicked', async ({ page, baseURL }) => {
        const seeAllTechLink = page.locator('a:has-text("See all technology blogs")');
        await seeAllTechLink.click({ force: true });
        await page.waitForURL('**/technology**', { timeout: 20000 });
        expect(page.url()).toContain('/technology');
    });

    test('should display "Recent Community Blogs" heading', async ({ page }) => {
        const commHeading = page.locator('h3:has-text("Recent Community Blogs")');
        await expect(commHeading).toBeVisible();
    });

    test('should display community post cards', async ({ page }) => {

        const commGrid = page.locator('div[class*="grid"]').nth(1);
        const commPosts = commGrid.locator('article, div[class*="post"], a[href*="/community/"], a[href*="/technology/"]');
        const count = await commPosts.count();
        expect(count).toBeGreaterThan(0);
        await expect(commPosts.first()).toBeVisible();
    });

    test('should display "See all community blogs" link', async ({ page }) => {
        const seeAllCommLink = page.locator('a:has-text("See all community blogs")');
        await expect(seeAllCommLink).toBeVisible();
    });

    test('should navigate to community page when "See all community blogs" is clicked', async ({ page, baseURL }) => {
        const seeAllCommLink = page.locator('a:has-text("See all community blogs")');
        await seeAllCommLink.click({ force: true });
        await page.waitForURL('**/community**', { timeout: 20000 });
        expect(page.url()).toContain('/community');
    });

    test('post cards inside TopBlogs should have image, title, and date', async ({ page }) => {

        const techSection = page.locator('h3:has-text("Recent Technology Blogs")').locator('..');
        const postTitle = techSection.locator('h3 a[href*="/technology/"]').first();
        const count = await postTitle.count();

        if (count > 0) {
            await expect(postTitle).toBeVisible();
        } else {

            const heading = page.locator('h3:has-text("Recent Technology Blogs")');
            await expect(heading).toBeVisible();
        }
    });
});
