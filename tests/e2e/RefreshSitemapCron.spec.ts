import { expect, test } from '@playwright/test';

test.describe('Refresh Sitemap Cron API', () => {
    test('returns 401 when authorization header is missing', async ({ request, baseURL }) => {
        const response = await request.get(`${baseURL}/api/cron/refresh-sitemap`);
        expect(response.status()).toBe(401);

        const body = await response.json();
        expect(body.ok).toBe(false);
    });

    test('returns 401 when authorization header is invalid', async ({ request, baseURL }) => {
        const response = await request.get(`${baseURL}/api/cron/refresh-sitemap`, {
            headers: {
                Authorization: 'Bearer wrong-secret',
            },
        });
        expect(response.status()).toBe(401);

        const body = await response.json();
        expect(body.ok).toBe(false);
    });

    test('returns 405 for non-GET methods with valid authorization', async ({ request, baseURL }) => {
        const response = await request.post(`${baseURL}/api/cron/refresh-sitemap`, {
            headers: {
                Authorization: 'Bearer test-secret',
            },
        });
        expect(response.status()).toBe(405);
        expect(response.headers()['allow']).toBe('GET');

        const body = await response.json();
        expect(body.ok).toBe(false);
    });

    test('returns 200 and refresh metadata for authorized GET', async ({ request, baseURL }) => {
        const response = await request.get(`${baseURL}/api/cron/refresh-sitemap`, {
            headers: {
                Authorization: 'Bearer test-secret',
            },
        });
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.ok).toBe(true);
        expect(body.entryCount).toBeGreaterThan(0);
        expect(typeof body.generatedAt).toBe('string');
        expect(typeof body.searchConsole?.submitted).toBe('boolean');
    });
});
