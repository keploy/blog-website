import { expect, test } from '@playwright/test';

test.describe('Sitemap Route', () => {
    test('/sitemap.xml should return XML with sitemap core routes', async ({ request, baseURL }) => {
        const response = await request.get(`${baseURL}/sitemap.xml`);

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/xml');
        expect(response.headers()['cache-control']).toContain('s-maxage=0');
        expect(response.headers()['cache-control']).toContain('stale-while-revalidate=86400');

        const xml = await response.text();
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
        expect(xml).toContain('<loc>https://keploy.io/blog</loc>');
        expect(xml).toContain('<loc>https://keploy.io/blog/technology</loc>');
        expect(xml).toContain('<loc>https://keploy.io/blog/community</loc>');
    });
});
