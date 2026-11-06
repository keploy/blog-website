import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation — Responsive', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL!);
        await page.waitForLoadState('domcontentloaded');
    });

    test('should hide desktop nav links on mobile', async ({ page }) => {

        const desktopNav = page.locator('.hidden.md\\:flex').first();
            await expect(desktopNav).not.toBeVisible();
    });

    test('should show hamburger menu button on mobile', async ({ page }) => {

        const menuButton = page.locator('button[aria-label="Open menu"], button[aria-label="Close menu"]').first();
        await expect(menuButton).toBeVisible();
    });

    test('should open mobile menu when hamburger is tapped', async ({ page }) => {
        const menuButton = page.locator('button[aria-label="Open menu"]').first();
        await expect(menuButton).toBeVisible();
        await expect(menuButton).toBeEnabled();
        await menuButton.click();

        const closeButton = page.locator('button[aria-label="Close menu"]');
        await expect(closeButton.first()).toBeVisible({ timeout: 5000 });
    });

    test('should display Technology and Community sections in mobile menu', async ({ page }) => {
        const menuButton = page.locator('button[aria-label="Open menu"]').first();
        await expect(menuButton).toBeVisible();
        await expect(menuButton).toBeEnabled();
        await menuButton.click();

        const closeButton = page.locator('button[aria-label="Close menu"]').first();
        await expect(closeButton).toBeVisible({ timeout: 5000 });

        const mobileMenu = page
            .locator('xpath=//div[contains(@class,"fixed") and contains(@class,"-translate-x-1/2") and contains(@class,"z-[1000]")]')
            .filter({ has: page.getByRole('link', { name: /sign in/i }) })
            .first();
        await expect(mobileMenu).toBeVisible();

        await expect(mobileMenu.getByText(/^Technology$/).first()).toBeVisible();
        await expect(mobileMenu.getByText(/^Community$/).first()).toBeVisible();
    });

    test('should display Resources section in mobile menu', async ({ page }) => {
        const menuButton = page.locator('button[aria-label="Open menu"]').first();
        await expect(menuButton).toBeVisible();
        await expect(menuButton).toBeEnabled();
        await menuButton.click();

        const closeButton = page.locator('button[aria-label="Close menu"]').first();
        await expect(closeButton).toBeVisible();
        const resourcesSection = page.locator('button:visible').filter({ hasText: 'Resources' }).first();
        await expect(resourcesSection).toBeVisible();
    });

    test('should expand Technology dropdown in mobile menu', async ({ page }) => {
        const menuButton = page.locator('button[aria-label="Open menu"]').first();
        await expect(menuButton).toBeVisible();
        await expect(menuButton).toBeEnabled();
        await menuButton.click();

        const techTrigger = page.locator('button[aria-label="Toggle Technology posts dropdown"]');
            await expect(techTrigger).toBeVisible();
            await expect(techTrigger).toBeEnabled();
            await techTrigger.click();

            const viewAll = page.locator('text=View All Technology Posts');
            await expect(viewAll).toBeVisible({ timeout: 3000 });
    });

    test('should show Sign in button in mobile menu', async ({ page }) => {
        const menuButton = page.locator('button[aria-label="Open menu"]').first();
        await expect(menuButton).toBeVisible();
        await expect(menuButton).toBeEnabled();
        await menuButton.click();

        const closeButton = page.locator('button[aria-label="Close menu"]').first();
        await expect(closeButton).toBeVisible();
        const signInLink = page.getByRole('link', { name: /sign in/i }).first();
        await expect(signInLink).toBeVisible();
    });

    test('should close mobile menu when hamburger is tapped again', async ({ page }) => {
        const openButton = page.locator('button[aria-label="Open menu"]').first();
        await expect(openButton).toBeVisible();
        await expect(openButton).toBeEnabled();
        await openButton.click();

        const closeButton = page.locator('button[aria-label="Close menu"]').first();
        await expect(closeButton).toBeVisible();
        await expect(closeButton).toBeEnabled();
        await closeButton.click();

        const reopenButton = page.locator('button[aria-label="Open menu"]');
        await expect(reopenButton.first()).toBeVisible({ timeout: 3000 });
    });

    test('should show mobile search button', async ({ page }) => {
        const searchButton = page.locator('button[aria-label="Open search"]').first();
        await expect(searchButton).toBeVisible();
    });

    test('should open search modal on mobile', async ({ page }) => {
        const searchButton = page.locator('button[aria-label="Open search"]').first();
        await expect(searchButton).toBeVisible();
        await expect(searchButton).toBeEnabled();
        await searchButton.click();

        const searchDialog = page.locator('[role="dialog"][aria-label="Search blogs"], h3:has-text("Search blogs")');
        await expect(searchDialog.first()).toBeVisible({ timeout: 3000 });
    });

    test('should display the Keploy logo on mobile', async ({ page }) => {
        const logo = page.locator('img[alt="Keploy Logo"]');
        await expect(logo.first()).toBeVisible();
    });
});
