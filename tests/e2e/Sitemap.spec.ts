import { expect, test } from '@playwright/test';

test.describe('Sitemap ISR Route', () => {
  test('/sitemap.xml returns 200 with correct Content-Type', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/xml');
  });

  test('/sitemap.xml has correct ISR Cache-Control headers', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    const cc = response.headers()['cache-control'] ?? '';
    // ISR: CDN caches 1h, browsers always revalidate, stale-while-revalidate 1h
    expect(cc).toContain('s-maxage=3600');
    expect(cc).toContain('max-age=0');
    expect(cc).toContain('stale-while-revalidate=3600');
  });

  test('/sitemap.xml contains valid XML sitemap structure', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    const xml = await response.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('</urlset>');
  });

  test('/sitemap.xml includes all static routes', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    const xml = await response.text();
    expect(xml).toContain('<loc>https://keploy.io/blog</loc>');
    expect(xml).toContain('<loc>https://keploy.io/blog/technology</loc>');
    expect(xml).toContain('<loc>https://keploy.io/blog/community</loc>');
  });

  test('/sitemap.xml contains dynamic post URLs from WordPress', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    const xml = await response.text();
    // Dynamic posts are served from WordPress via ISR — should contain at least 1 post URL
    const locMatches = xml.match(/<loc>/g) ?? [];
    expect(locMatches.length).toBeGreaterThan(5);
  });

  test('/sitemap.xml <url> entries have <lastmod> dates', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    const xml = await response.text();
    // Every <url> block should include a <lastmod>
    expect(xml).toContain('<lastmod>');
    // lastmod should be a valid ISO date fragment (YYYY-MM-DD)
    expect(xml).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}/);
  });

  test('/sitemap.xml <url> entries have <changefreq>', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    const xml = await response.text();
    expect(xml).toContain('<changefreq>');
  });

  test('sitemap.xml is not served with a Content-Security-Policy header', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    // CSP is intentionally excluded from sitemap (XML parsers do not understand it)
    const csp = response.headers()['content-security-policy'];
    expect(csp).toBeUndefined();
  });

  test('/sitemap.xml URLs are deduplicated', async ({ request, baseURL }) => {
    const response = await request.get(`${baseURL}/sitemap.xml`);
    const xml = await response.text();
    const locs = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map(m => m[1]);
    const unique = new Set(locs);
    expect(unique.size).toBe(locs.length);
  });
});
