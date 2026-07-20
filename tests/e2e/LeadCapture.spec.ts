import { test, expect, Route } from '@playwright/test';

/**
 * Newsletter lead capture → telemetry /blog-mql with an invisible reCAPTCHA
 * Enterprise token. The Google loader is stubbed so the test is deterministic
 * and offline: window.grecaptcha.enterprise is injected before hydration and
 * the real enterprise.js request is fulfilled with an empty script.
 */
test.describe('Newsletter lead capture (blog-mql + reCAPTCHA)', () => {
  // The sidebar renders twice (desktop ≥1440px + mobile fallback); use a wide
  // viewport so the first DOM instance is the visible one.
  test.use({ viewport: { width: 1600, height: 1000 } });

  let leadRequests: Array<Record<string, unknown>>;

  test.beforeEach(async ({ page, baseURL }) => {
    leadRequests = [];

    await page.route('https://www.google.com/recaptcha/enterprise.js*', (route: Route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stubbed loader */' })
    );

    await page.addInitScript(() => {
      (window as any).grecaptcha = {
        enterprise: {
          ready: (cb: () => void) => cb(),
          execute: async () => 'e2e-stub-token',
        },
      };
    });

    // No OPTIONS handling needed: Playwright's interception bypasses CORS
    // entirely for route.fulfill'd requests — the handler only ever sees POST.
    await page.route('**/blog-mql', async (route: Route) => {
      leadRequests.push(route.request().postDataJSON());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"success":true}',
      });
    });

    const targetUrl = baseURL
      ? `${baseURL}/technology`
      : 'http://localhost:3000/blog/technology';
    await page.goto(targetUrl);
    await page.waitForLoadState('domcontentloaded');

    const firstPost = page.locator('a[href*="/technology/"]').first();
    await expect(firstPost).toBeVisible({ timeout: 15000 });
    await firstPost.click();
    await page.waitForLoadState('domcontentloaded');
  });

  test('submitting the newsletter form sends a lead with the reCAPTCHA token', async ({ page }) => {
    const form = page.locator('form', { has: page.getByPlaceholder('Full Name') }).first();
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible({ timeout: 15000 });

    await form.getByPlaceholder('Full Name').fill('E2E Tester');
    await form.getByPlaceholder('Email').fill('e2e@keploy.io');
    await form.getByPlaceholder('Company Name').fill('Keploy');
    await form.locator('button[type="submit"]').click();

    await expect
      .poll(() => leadRequests.length, { timeout: 10000, message: 'lead POST should fire' })
      .toBeGreaterThan(0);

    const lead = leadRequests[0];
    expect(lead.email).toBe('e2e@keploy.io');
    expect(lead.name).toBe('E2E Tester');
    expect(lead.company).toBe('Keploy');
    expect(lead.source).toBe('blog-newsletter');
    expect(lead.assetType).toBe('newsletter');
    expect(lead.recaptchaToken).toBe('e2e-stub-token');
    expect(String(lead.page)).toContain('/blog/');
  });

  test('shows the reCAPTCHA attribution required for the hidden badge', async ({ page }) => {
    const attribution = page.getByText('Protected by reCAPTCHA').first();
    await attribution.scrollIntoViewIfNeeded();
    await expect(attribution).toBeVisible({ timeout: 15000 });
  });

  test('lead is still sent with an empty token when reCAPTCHA is unavailable (fail open)', async ({ page }) => {
    // Remove the stub and make the loader fail — the form must not block.
    await page.addInitScript(() => {
      delete (window as any).grecaptcha;
    });
    await page.route('https://www.google.com/recaptcha/enterprise.js*', (route: Route) => route.abort());
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const form = page.locator('form', { has: page.getByPlaceholder('Full Name') }).first();
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible({ timeout: 15000 });

    await form.getByPlaceholder('Full Name').fill('Blocked User');
    await form.getByPlaceholder('Email').fill('blocked@keploy.io');
    await form.getByPlaceholder('Company Name').fill('Keploy');
    await form.locator('button[type="submit"]').click();

    await expect
      .poll(() => leadRequests.length, { timeout: 10000, message: 'fail-open lead POST should fire' })
      .toBeGreaterThan(0);
    expect(leadRequests[0].recaptchaToken).toBe('');
  });
});
