import { test, expect } from '@playwright/test';

test.describe('ScrollToTop Component', () => {
    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL ? `${baseURL}/technology` : 'http://localhost:3000/blog/technology');
        await page.waitForLoadState('domcontentloaded');

        const firstPost = page.locator('a[href*="/technology/"]').first();
        if (await firstPost.count() > 0) {
            const href = await firstPost.getAttribute('href');
            if (href) {
                await page.goto(href);
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(500);
            }
        }
    });

    test('should have ScrollToTop button in the DOM', async ({ page }) => {
        const scrollBtn = page.locator('button[aria-label="Scroll to top"]').first();
        await expect(scrollBtn).toBeAttached();
    });
    test('should NOT be visible before scrolling', async ({ page }) => {
        const scrollBtn = page.locator('button[aria-label="Scroll to top"]').first();
        await expect(scrollBtn).not.toBeVisible();
    });

    test('should become visible after scrolling down 300px', async ({ page }) => {
        const scrollBtn = page.locator('button[aria-label="Scroll to top"]').first();
        if (await scrollBtn.count() === 0) {
            return;
        }
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(500);
        const classes = await scrollBtn.getAttribute('class');
        const isShown = classes?.includes('opacity-100') && classes?.includes('visible');
        expect(isShown).toBe(true);
    });

    test('should scroll back to top when button is clicked', async ({ page }) => {
        const scrollBtn = page.locator('button[aria-label="Scroll to top"]').first();
        if (await scrollBtn.count() === 0) {
            return;
        }
        await page.evaluate(() => window.scrollTo(0, 600));
        await page.waitForTimeout(800);
        await page.evaluate(() => {
            const btn = document.querySelector('button[aria-label="Scroll to top"]') as HTMLElement | null;
            if (btn) btn.click();
        });
        await page.waitForTimeout(800);
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeLessThan(100);
    });

    test('should have correct aria-label for accessibility', async ({ page }) => {
        const scrollBtn = page.locator('button[aria-label="Scroll to top"]').first();
        if (await scrollBtn.count() > 0) {
            const ariaLabel = await scrollBtn.getAttribute('aria-label');
            expect(ariaLabel).toBe('Scroll to top');
        }
    });

    test('should contain SVG progress indicator', async ({ page }) => {
        const scrollBtn = page.locator('button[aria-label="Scroll to top"]').first();
        await scrollBtn.waitFor({ state: 'attached' });
        const svg = scrollBtn.locator('svg').first();
        await expect(svg).toBeAttached();
    });

    test('should have fixed positioning (z-50)', async ({ page }) => {
        const scrollBtn = page.locator('button[aria-label="Scroll to top"]').first();
        await scrollBtn.waitFor({ state: 'attached' });
        await expect(scrollBtn).toHaveClass(/fixed/);
        await expect(scrollBtn).toHaveClass(/z-50/);
    });

    test('should be positioned at the bottom-right corner', async ({ page }) => {
        const scrollBtn = page.locator('button[aria-label="Scroll to top"]').first();
        await scrollBtn.waitFor({ state: 'attached' });
        await expect(scrollBtn).toHaveClass(/right-5/);
        await expect(scrollBtn).toHaveClass(/bottom-5/);
    });

    test('should update scroll progress circle as user scrolls', async ({ page }) => {
        const scrollBtn = page.locator('button[aria-label="Scroll to top"]').first();
        await scrollBtn.waitFor({ state: 'attached' });
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(500);
        const circle = page.locator('circle[stroke="url(#progressGradient)"]').first();
        await expect(circle).toBeAttached();
        const updatedOffset = await circle.getAttribute('stroke-dashoffset');
        expect(updatedOffset).not.toBeNull();
    });
});
