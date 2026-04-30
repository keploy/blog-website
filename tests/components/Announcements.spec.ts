import { test, expect, type Page } from '@playwright/test';

const announcementRegionSelector = '[role="region"][aria-label="Event announcement"]';

const dispatchSyntheticTouch = async (
  page: Page,
  selector: string,
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: Array<{ clientX: number; clientY: number }>
) => {
  await page.evaluate(
    ({ targetSelector, eventType, touchPoints }) => {
      const el = document.querySelector(targetSelector);
      if (!el) {
        throw new Error(`Element not found for selector: ${targetSelector}`);
      }

      const event = new Event(eventType, { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'touches', {
        configurable: true,
        value: touchPoints,
      });
      Object.defineProperty(event, 'changedTouches', {
        configurable: true,
        value: touchPoints,
      });

      el.dispatchEvent(event);
    },
    { targetSelector: selector, eventType: type, touchPoints: touches }
  );
};

test.describe('Announcements — Desktop', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render with correct ARIA role and label', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });
  });

  test('should display the "Event LIVE" eyebrow badge on desktop', async ({ page }) => {
    // The eyebrow badge is only shown in the desktop layout (hidden on < lg)
    const badge = page
      .locator('.hidden.lg\\:flex span')
      .filter({ hasText: 'Event LIVE' })
      .first();
    await expect(badge).toBeVisible({ timeout: 5000 });
  });

  test('should display the dismiss button on desktop', async ({ page }) => {
    const dismissBtn = page.locator('button[aria-label="Dismiss announcement"]');
    await expect(dismissBtn).toBeVisible({ timeout: 5000 });
  });

  test('should display the CTA link with correct href', async ({ page }) => {
    // Target the desktop CTA specifically — the mobile one (lg:hidden) is first in the DOM
    // but hidden at desktop viewport, so we scope to the desktop layout container.
    const ctaLink = page.locator('.hidden.lg\\:flex a[href="https://luma.com/lr79szro"]');
    await expect(ctaLink).toBeVisible({ timeout: 5000 });
    const href = await ctaLink.getAttribute('href');
    expect(href).toBe('https://luma.com/lr79szro');
  });

  test('should open CTA link in a new tab', async ({ page }) => {
    const ctaLink = page.locator('.hidden.lg\\:flex a[href="https://luma.com/lr79szro"]');
    await expect(ctaLink).toBeVisible({ timeout: 5000 });
    expect(await ctaLink.getAttribute('target')).toBe('_blank');
    expect(await ctaLink.getAttribute('rel')).toContain('noopener');
  });

  test('should display "Register NOW" CTA label', async ({ page }) => {
    const ctaLink = page.locator('.hidden.lg\\:flex a[href="https://luma.com/lr79szro"]');
    await expect(ctaLink).toBeVisible({ timeout: 5000 });
    await expect(ctaLink).toContainText('Register NOW');
  });

  test('should display marquee event text', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toContainText('GitTogether SF');
    await expect(banner).toContainText('San Francisco');
  });

  test('should set --announcement-h CSS variable to a non-zero value when visible', async ({
    page,
  }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });

    const announcementH = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--announcement-h').trim(),
    );
    expect(announcementH).not.toBe('');
    expect(announcementH).not.toBe('0px');
    // Should be a pixel value like "40px"
    expect(announcementH).toMatch(/^\d+(\.\d+)?px$/);
  });

  test('should hide the announcement bar when dismiss button is clicked', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });

    const dismissBtn = page.locator('button[aria-label="Dismiss announcement"]');
    await expect(dismissBtn).toBeVisible();
    await expect(dismissBtn).toBeEnabled();
    await dismissBtn.click();

    await expect(banner).not.toBeVisible({ timeout: 5000 });
  });

  test('should set --announcement-h to 0px after dismiss', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });

    const dismissBtn = page.locator('button[aria-label="Dismiss announcement"]');
    await dismissBtn.click();
    await expect(banner).not.toBeVisible({ timeout: 5000 });

    const announcementH = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--announcement-h').trim(),
    );
    expect(announcementH).toBe('0px');
  });

  test('should be positioned at the top of the page (fixed)', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });

    const box = await banner.boundingBox();
    expect(box).not.toBeNull();
    // Fixed at top: y should be at or very near 0
    expect(box!.y).toBeLessThanOrEqual(2);
  });

  test('should remain visible after scrolling the page', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });

    await page.evaluate(() => window.scrollTo(0, 500));

    await expect(banner).toBeVisible();
    const box = await banner.boundingBox();
    expect(box!.y).toBeLessThanOrEqual(2);
  });
});

test.describe('Announcements — Mobile', () => {
  test.use({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  });

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render the announcement bar on mobile', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });
  });

  test('should show the dismiss button on mobile for accessibility', async ({ page }) => {
    const dismissBtn = page.locator('button[aria-label="Dismiss announcement"]');
    // Dismiss button is visible on all viewports so keyboard/screen-reader users
    // can dismiss without relying solely on the swipe gesture.
    await expect(dismissBtn).toBeVisible({ timeout: 5000 });
  });

  test('should display the compact mobile CTA button', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });

    // The mobile CTA link is inside the mobile-only layout (shown below lg)
    const mobileCta = page
      .locator('.lg\\:hidden a[href="https://luma.com/lr79szro"]')
      .first();
    await expect(mobileCta).toBeVisible({ timeout: 5000 });
    await expect(mobileCta).toContainText('Register NOW');
  });

  test('should display marquee event text on mobile', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toContainText('GitTogether SF');
  });

  test('should dismiss when swiped up past the threshold', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });

    const box = await banner.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const startY = box!.y + box!.height / 2;

    // Simulate a swipe-up gesture: start in the banner, move up > 50px, then release
    await dispatchSyntheticTouch(page, announcementRegionSelector, 'touchstart', [
      { clientX: centerX, clientY: startY },
    ]);
    await dispatchSyntheticTouch(page, announcementRegionSelector, 'touchmove', [
      { clientX: centerX, clientY: startY - 70 },
    ]);
    await dispatchSyntheticTouch(page, announcementRegionSelector, 'touchend', []);

    // After the swipe-up, the bar should animate out (220ms timeout in the component)
    await expect(banner).not.toBeVisible({ timeout: 2000 });
  });

  test('should not dismiss when swiped up below the threshold (< 50px)', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });

    const box = await banner.boundingBox();
    expect(box).not.toBeNull();

    const centerX = box!.x + box!.width / 2;
    const startY = box!.y + box!.height / 2;

    // Swipe up only 20px — below the 50px dismiss threshold
    await dispatchSyntheticTouch(page, announcementRegionSelector, 'touchstart', [
      { clientX: centerX, clientY: startY },
    ]);
    await dispatchSyntheticTouch(page, announcementRegionSelector, 'touchmove', [
      { clientX: centerX, clientY: startY - 20 },
    ]);
    await dispatchSyntheticTouch(page, announcementRegionSelector, 'touchend', []);

    // Bar should still be visible
    await expect(banner).toBeVisible({ timeout: 1000 });
  });

  test('should set --announcement-h CSS variable on mobile', async ({ page }) => {
    const banner = page.locator(announcementRegionSelector);
    await expect(banner).toBeVisible({ timeout: 5000 });

    const announcementH = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--announcement-h').trim(),
    );
    expect(announcementH).toMatch(/^\d+(\.\d+)?px$/);
    expect(announcementH).not.toBe('0px');
  });
});
