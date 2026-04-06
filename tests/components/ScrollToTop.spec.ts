import { test, expect } from '@playwright/test';

test.describe('ScrollToTop Component', () => {
    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL ? `${baseURL}/technology` : 'http://localhost:3000/blog/technology');
        await page.waitForLoadState('domcontentloaded');

        const firstPost = page.locator('a[href*="/technology/"]').first();
        await expect(firstPost).toBeVisible({ timeout: 15000 });
        await expect(firstPost).toBeEnabled();
        const href = await firstPost.getAttribute('href');
        expect(href).toBeTruthy();
        await page.goto(href!);
        await page.waitForLoadState('domcontentloaded');
        await expect(page.getByTestId('scroll-to-top').first()).toBeAttached();
    });

    test('should have ScrollToTop button in the DOM', async ({ page }) => {
        const scrollBtn = page.getByTestId('scroll-to-top').first();
        await expect(scrollBtn).toBeAttached();
    });
    test('should NOT be visible before scrolling', async ({ page }) => {
        const scrollBtn = page.getByTestId('scroll-to-top').first();
        await expect(scrollBtn).not.toBeVisible();
    });

    test('should become visible after scrolling down 300px', async ({ page }) => {
        const scrollBtn = page.getByTestId('scroll-to-top').first();
        await expect(scrollBtn).toBeAttached();
        await page.evaluate(() => window.scrollTo(0, 500));
        await expect(scrollBtn).toHaveClass(/opacity-100/);
        await expect(scrollBtn).toHaveClass(/visible/);
    });

    test('should scroll back to top when button is clicked', async ({ page }) => {
        const scrollBtn = page.getByTestId('scroll-to-top').first();
        await expect(scrollBtn).toBeAttached();
        await page.evaluate(() => window.scrollTo(0, 600));
        await expect(scrollBtn).toBeVisible();
        await scrollBtn.click();
        await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(100);
    });

    test('should have correct aria-label for accessibility', async ({ page }) => {
        const scrollBtn = page.getByTestId('scroll-to-top').first();
        const ariaLabel = await scrollBtn.getAttribute('aria-label');
        expect(ariaLabel).toBe('Scroll to top');
    });

    test('should contain SVG progress indicator', async ({ page }) => {
        const scrollBtn = page.getByTestId('scroll-to-top').first();
        await scrollBtn.waitFor({ state: 'attached' });
        const svg = scrollBtn.locator('svg').first();
        await expect(svg).toBeAttached();
    });

    test('should have fixed positioning (z-50)', async ({ page }) => {
        const scrollBtn = page.getByTestId('scroll-to-top').first();
        await scrollBtn.waitFor({ state: 'attached' });
        await expect(scrollBtn).toHaveClass(/fixed/);
        await expect(scrollBtn).toHaveClass(/z-50/);
    });

    test('should be positioned at the bottom-right corner', async ({ page }) => {
        const scrollBtn = page.getByTestId('scroll-to-top').first();
        await scrollBtn.waitFor({ state: 'attached' });
        await expect(scrollBtn).toHaveClass(/right-5/);
        await expect(scrollBtn).toHaveClass(/bottom-5/);
    });

    test('should update scroll progress circle as user scrolls', async ({ page }) => {
        const scrollBtn = page.getByTestId('scroll-to-top').first();
        await scrollBtn.waitFor({ state: 'attached' });
        await page.evaluate(() => window.scrollTo(0, 500));
        const circle = page.locator('circle[stroke="url(#progressGradient)"]').first();
        await expect(circle).toBeAttached();
        await expect.poll(async () => circle.getAttribute('stroke-dashoffset')).not.toBeNull();
    });
});
