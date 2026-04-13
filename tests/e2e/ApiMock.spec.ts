import { test, expect } from '@playwright/test';
import emptySearchResponse from '../fixtures/empty-search-response.json';
import errorResponse from '../fixtures/error-response.json';

test.describe('API Mocking — SSR Page Rendering', () => {

    test('Technology index page should render posts from mock API', async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/technology`);
        await page.waitForLoadState('domcontentloaded');

        const heroTitle = page.locator('h3:has-text("Understanding API Testing with Keploy")');
        await expect(heroTitle).toBeVisible({ timeout: 15000 });

        const secondPost = page.locator('h3:has-text("Getting Started with Unit Testing in Go")');
        await expect(secondPost).toBeVisible();

        const authorName = page.locator('text=Tech Author One');
        await expect(authorName.first()).toBeVisible();
    });

    test('Individual post page should render content from mock API', async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/technology/understanding-api-testing-with-keploy`);
        await page.waitForLoadState('domcontentloaded');

        const postTitle = page.locator('h1, h2, h3').filter({ hasText: 'Understanding API Testing with Keploy' });
        await expect(postTitle.first()).toBeVisible({ timeout: 15000 });

        const authorName = page.locator('text=Tech Author One');
        await expect(authorName.first()).toBeVisible();

        const mainContent = page.locator('article');
        await expect(mainContent.first()).toBeVisible();
    });
});

test.describe('API Mocking — Client-Side Search Resilience', () => {

    test('Search should filter posts from SSR mock data on technology index', async ({ page, baseURL }) => {

        await page.goto(`${baseURL!}/technology`);
        await page.waitForLoadState('domcontentloaded');

        const searchInput = page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toBeVisible();

        await searchInput.fill('Unit Testing');

        const matchingPost = page.locator('h3:has-text("Getting Started with Unit Testing in Go")');
        await expect(matchingPost).toBeVisible({ timeout: 10000 });

        const nonMatchingPost = page.locator('h3:has-text("CI/CD Pipeline Best Practices")');
        await expect(nonMatchingPost).not.toBeVisible();
    });

    test('Search should gracefully handle empty results from mock API', async ({ page, baseURL }) => {
        await page.route('**/graphql', async route => {
            const request = route.request();
            if (request.method() === 'POST' && request.postData()?.includes('AllPostsForSearch')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(emptySearchResponse)
                });
                return;
            }
            await route.continue();
        });

        await page.goto(`${baseURL!}/technology`);
        await page.waitForLoadState('domcontentloaded');

        const searchInput = page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toBeVisible();

        await searchInput.fill('Nonexistent Query');

        const emptyMessage = page.locator('text=No posts found matching');
        await expect(emptyMessage).toBeVisible();

        await expect(page.locator('h3:has-text("Mocked Technology Post")')).not.toBeVisible();
    });

    test('Search should gracefully handle 500 error from mock API', async ({ page, baseURL }) => {
        await page.route('**/graphql', async route => {
            const request = route.request();
            if (request.method() === 'POST' && request.postData()?.includes('AllPostsForSearch')) {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify(errorResponse)
                });
                return;
            }
            await route.continue();
        });

        await page.goto(`${baseURL!}/technology`);
        await page.waitForLoadState('domcontentloaded');

        const searchInput = page.locator('input[placeholder*="Search"]');
        await expect(searchInput).toBeVisible();

        await searchInput.fill('Error trigger');

        const container = page.locator('main, section').first();
        await expect(container).toBeVisible();
    });
});
