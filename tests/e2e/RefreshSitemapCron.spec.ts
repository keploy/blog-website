import { expect, test } from '@playwright/test';

// CRON_SECRET is injected as 'test-secret' via playwright.config.ts webServer env.
// These tests call the Pages API route directly using the Playwright request fixture.

test.describe('Refresh Sitemap Cron API', () => {
  test('returns 401 when Authorization header is missing', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/cron/refresh-sitemap`);
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  test('returns 401 when Authorization header has wrong secret', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/api/cron/refresh-sitemap`, {
      headers: { Authorization: 'Bearer wrong-secret' },
    });
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  test('returns 405 for POST with valid Authorization', async ({ request, baseURL }) => {
    // Auth is checked before method guard — valid token must be used to reach the method check
    const response = await request.post(`${baseURL}/api/cron/refresh-sitemap`, {
      headers: { Authorization: 'Bearer test-secret' },
    });
    expect(response.status()).toBe(405);
    expect(response.headers()['allow']).toBe('GET');

    const body = await response.json();
    expect(body.ok).toBe(false);
  });

  test('returns 200 for authorized GET when GSC is not configured', async ({ request, baseURL }) => {
    // In the test environment Google Search Console env vars are not set,
    // so the handler skips GSC submission and returns a "skipped" success.
    const response = await request.get(`${baseURL}/api/cron/refresh-sitemap`, {
      headers: { Authorization: 'Bearer test-secret' },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    // GSC not configured in test env — handler returns a message, not siteUrl/sitemapUrl
    expect(typeof body.message).toBe('string');
  });

  test('unauthenticated callers get 401, not 405 — method not leaked', async ({ request, baseURL }) => {
    // Security: method guard must not run before auth check so that
    // unauthenticated callers cannot probe which HTTP methods are valid.
    const response = await request.post(`${baseURL}/api/cron/refresh-sitemap`);
    expect(response.status()).toBe(401);
  });

  test('Cache-Control header prevents caching of cron response', async ({ request, baseURL }) => {
    // Cache-Control: no-store is set by the handler itself (res.setHeader in refresh-sitemap.ts).
    // vercel.json also enforces it on /blog/api/* routes in production, but in local/CI
    // Playwright runs against the Next.js dev server where vercel.json headers are not applied.
    const response = await request.get(`${baseURL}/api/cron/refresh-sitemap`, {
      headers: { Authorization: 'Bearer test-secret' },
    });
    const cc = response.headers()['cache-control'] ?? '';
    expect(cc).toContain('no-store');
  });
});
