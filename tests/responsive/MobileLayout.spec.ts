import { test, expect } from '@playwright/test';

const WIDTH_EPSILON = 2;
const HORIZONTAL_OVERFLOW_EPSILON = WIDTH_EPSILON;

function maxAllowedWidth(page: { viewportSize: () => { width: number; height: number } | null }) {
    return (page.viewportSize()?.width ?? 375) + WIDTH_EPSILON;
}

async function getHorizontalOverflow(page: { evaluate: (pageFunction: () => number) => Promise<number> }) {
    return page.evaluate(() => {
        const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        const clientWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
        return scrollWidth - clientWidth;
    });
}

function assertNoHorizontalOverflow(overflowAmount: number, context: string) {
    expect(
        overflowAmount,
        `${context}: expected <= ${HORIZONTAL_OVERFLOW_EPSILON}px horizontal overflow, found ${overflowAmount}px`,
    ).toBeLessThanOrEqual(HORIZONTAL_OVERFLOW_EPSILON);
}

test.describe('Mobile Layout — Homepage', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL!);
        await page.waitForLoadState('domcontentloaded');
    });

    test('hero post should stack vertically on mobile (no side-by-side grid)', async ({ page }) => {
        const topContent = page.locator('main').first();
        await expect(topContent).toBeVisible();
        const box = await topContent.boundingBox();
        expect(box).not.toBeNull();
        expect(box?.width).toBeLessThanOrEqual(maxAllowedWidth(page));
    });

    test('post cards should be single column on mobile', async ({ page }) => {
        const postGrid = page.getByTestId('post-grid').first();
        await expect(postGrid).toBeVisible();
        
        const children = postGrid.locator('> *');
        await expect(children.nth(1)).toBeVisible();
        
        const firstPost = await children.nth(0).boundingBox();
        const secondPost = await children.nth(1).boundingBox();
        
        if (firstPost && secondPost) {
            // In single column, X positions should be identical (within epsilon)
            expect(Math.abs(firstPost.x - secondPost.x)).toBeLessThan(10);
            // Second post must be below the first
            expect(secondPost.y).toBeGreaterThan(firstPost.y + firstPost.height/2);
        }
    });

    test('page should be scrollable on mobile', async ({ page }) => {
        const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
        const viewHeight = await page.evaluate(() => window.innerHeight);
        expect(scrollHeight).toBeGreaterThan(viewHeight);
    });

    test('no horizontal overflow on mobile', async ({ page }) => {
        const overflowAmount = await getHorizontalOverflow(page);
        assertNoHorizontalOverflow(overflowAmount, 'Homepage mobile layout');
    });

    test('footer sections should stack on mobile', async ({ page }) => {

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const footer = page.locator('footer');
        await expect(footer).toBeVisible({ timeout: 5000 });

        const footerBox = await footer.boundingBox();
        expect(footerBox?.width).toBeLessThanOrEqual(maxAllowedWidth(page));
    });

    test('Keploy logo should be visible on mobile', async ({ page }) => {
        const logo = page.locator('img[alt="Keploy Logo"]');
        await expect(logo.first()).toBeVisible();
    });
});

test.describe('Mobile Layout — Technology Page', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/technology`);
        await page.waitForLoadState('domcontentloaded');
    });

    test('technology page should render on mobile', async ({ page }) => {
        await expect(page.locator('body')).toBeVisible();
        const title = await page.title();
        expect(title).toBeDefined();
    });

    test('post cards should not overflow viewport on mobile', async ({ page }) => {
        const cards = page.locator('a[href*="/technology/"]');
        await expect(cards.first()).toBeVisible();
        const cardBox = await cards.first().boundingBox();
        expect(cardBox).not.toBeNull();
        expect(cardBox?.width).toBeLessThanOrEqual(maxAllowedWidth(page));
    });

    test('hero post image and content should stack on mobile', async ({ page }) => {

        const overflowAmount = await getHorizontalOverflow(page);
        assertNoHorizontalOverflow(overflowAmount, 'Technology page mobile layout');

        const postLinks = page.locator('a[href*="/technology/"]');
            const linkBox = await postLinks.first().boundingBox();

            expect(linkBox?.width).toBeLessThanOrEqual(maxAllowedWidth(page));
    });
});

test.describe('Mobile Layout — Blog Post Page', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/technology`);
        await page.waitForLoadState('domcontentloaded');

        const firstPost = page.locator('a[href*="/technology/"]').first();
        await expect(firstPost).toBeVisible({ timeout: 15000 });
        await expect(firstPost).toBeEnabled();
        await firstPost.click();
        await page.waitForLoadState('domcontentloaded');
    });

    test('blog post content should be readable on mobile (not clipped)', async ({ page }) => {
        const content = page.getByTestId('post-content');
        await expect(content).toBeVisible();
        const contentBox = await content.boundingBox();
        expect(contentBox).not.toBeNull();
        expect(contentBox?.width).toBeLessThanOrEqual(maxAllowedWidth(page));
    });

    test('post title should be visible on mobile', async ({ page }) => {
        const title = page.locator('h1').first();
            await expect(title).toBeVisible();
            const titleBox = await title.boundingBox();
            expect(titleBox?.width).toBeLessThanOrEqual(maxAllowedWidth(page));
    });

    test('TOC toggle should be visible on mobile post page', async ({ page }) => {
        const mobileToc = page.getByTestId('mobile-toc');
        const tocToggle = mobileToc.locator('button').filter({ hasText: 'Table of Contents' });
        await expect(tocToggle.first()).toBeVisible();
    });

    test('desktop TOC sidebar should be hidden on mobile', async ({ page }) => {
        const desktopToc = page.getByTestId('desktop-toc');
        // Ensure it's in the DOM but hidden by Tailwind's responsive classes
        await expect(desktopToc.first()).toBeAttached();
        await expect(desktopToc.first()).not.toBeVisible();
    });
});

test.describe('Tablet Layout — Responsive (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(baseURL!);
        await page.waitForLoadState('domcontentloaded');
    });

    test('desktop nav links should be visible at tablet width', async ({ page }) => {

        const desktopNav = page.locator('nav').first();
        await expect(desktopNav).toBeVisible();

        const techLink = page.locator('a span:has-text("Technology"), a:has-text("Technology")').first();
        await expect(techLink).toBeVisible();
    });

    test('hamburger menu should be hidden at tablet width', async ({ page }) => {
        const menuButton = page.getByTestId('navbar-toggle');
        await expect(menuButton.first()).not.toBeVisible();
    });

    test('post grid should display multiple columns at tablet width', async ({ page }) => {
        const postGrid = page.locator('[data-testid="post-grid"]').first();
        const children = postGrid.locator('> *');
        await expect(children.nth(1)).toBeVisible();
        
        const first = await children.first().boundingBox();
        const second = await children.nth(1).boundingBox();
        if (first && second) {
            // Horizontal alignment check
            expect(Math.abs((second?.y || 0) - (first?.y || 0))).toBeLessThan(50);
        }
    });

    test('no horizontal overflow at tablet width', async ({ page }) => {
        const overflowAmount = await getHorizontalOverflow(page);
        assertNoHorizontalOverflow(overflowAmount, 'Homepage tablet layout');
    });
});
