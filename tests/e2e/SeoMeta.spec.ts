import { test, expect } from '@playwright/test';

test.describe('SEO and Meta Tags Configuration', () => {

    test('Homepage should have correct SEO meta tags', async ({ page, baseURL }) => {
        await page.goto(baseURL!);

        const metaDesc = page.locator('meta[name="description"]');
        await expect(metaDesc).toHaveAttribute('content', /The Keploy Blog offers in-depth articles/);

        const ogTitle = page.locator('meta[property="og:title"]');
        await expect(ogTitle).toHaveAttribute('content', /Blog - Keploy/);

        const ogDesc = page.locator('meta[property="og:description"]');
        await expect(ogDesc).toHaveAttribute('content', /The Keploy Blog offers in-depth articles/);

        const ogImage = page.locator('meta[property="og:image"]');
        const imageContent = await ogImage.getAttribute('content');
        expect(imageContent).toBeTruthy();
        expect(imageContent?.startsWith('http') || imageContent?.startsWith('/blog')).toBe(true);
    });

    test('Technology Index page should have correct SEO meta tags', async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/technology`);

        await expect(page).toHaveTitle(/Keploy/);

        const ogTitle = page.locator('meta[property="og:title"]');
        await expect(ogTitle.first()).toBeAttached();

        const ogDesc = page.locator('meta[property="og:description"]');
        await expect(ogDesc).toHaveAttribute('content', /Keploy technology articles/);
    });

    test('Individual Post page should have dynamic SEO meta tags', async ({ page, baseURL }) => {

        await page.goto(`${baseURL!}/technology/understanding-api-testing-with-keploy`);
        await page.waitForLoadState('domcontentloaded');

        await expect(page).not.toHaveTitle('Keploy Blog');

        const twitterCard = page.locator('meta[name="twitter:card"]').first();
        await expect(twitterCard).toBeAttached();
        await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
    });

    test('Post page should have canonical URL and og:url meta tags', async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/technology/understanding-api-testing-with-keploy`);
        await page.waitForLoadState('domcontentloaded');

        const canonical = page.locator('link[rel="canonical"]');
        await expect(canonical).toBeAttached();
        const canonicalHref = await canonical.getAttribute('href');
        expect(canonicalHref).toMatch(/^https:\/\/keploy\.io\/blog\//);

        const ogUrl = page.locator('meta[property="og:url"]');
        await expect(ogUrl).toBeAttached();
        const ogUrlContent = await ogUrl.getAttribute('content');
        expect(ogUrlContent).toMatch(/^https:\/\/keploy\.io\/blog\//);

        const ogType = page.locator('meta[property="og:type"]');
        await expect(ogType).toHaveAttribute('content', 'article');
    });

    test('Post page should expose article:published_time as ISO-8601', async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/technology/understanding-api-testing-with-keploy`);
        await page.waitForLoadState('domcontentloaded');

        const publishedTime = page.locator('meta[property="article:published_time"]');
        await expect(publishedTime).toBeAttached();
        const content = await publishedTime.getAttribute('content');
        // ISO-8601 datetime: YYYY-MM-DDTHH:MM:SS with optional fractional seconds and timezone.
        expect(content).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/);
    });

    test('Homepage should have og:type website', async ({ page, baseURL }) => {
        await page.goto(baseURL!);

        const ogType = page.locator('meta[property="og:type"]');
        await expect(ogType).toHaveAttribute('content', 'website');
    });

    test('JSON-LD Structured Data should be injected for SEO parsing', async ({ page, baseURL }) => {
        await page.goto(baseURL!);

        const schemas = page.locator('script[type="application/ld+json"]');
        await expect(schemas.first()).toBeAttached();

        const scriptContents = await schemas.allTextContents();
        let foundValidSchema = false;

        for (const content of scriptContents) {
            try {
                const parsedSchema = JSON.parse(content);
                if (parsedSchema && parsedSchema['@context'] === 'https://schema.org') {
                    if (parsedSchema['@type'] === 'Organization' ||
                        parsedSchema['@type'] === 'WebSite' ||
                        (Array.isArray(parsedSchema['@graph']) && parsedSchema['@graph'].length > 0) ||
                        parsedSchema['@type'] === 'BreadcrumbList') {
                        foundValidSchema = true;
                        break;
                    }
                }
            } catch (e) {
                // ignore JSON parse errors
            }
        }

        expect(foundValidSchema).toBe(true);
    });

    test('sitemap.xml endpoint should return XML with the static blog entries', async ({ request, baseURL }) => {
        // Use the full URL because Playwright's request.get resolves a
        // leading-slash path against the host, not against baseURL's path,
        // so '/sitemap.xml' would bypass Next.js's /blog basePath.
        const response = await request.get(`${baseURL!}/sitemap.xml`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toMatch(/xml/);

        const body = await response.text();
        expect(body).toContain('<?xml');
        expect(body).toContain('<urlset');
        // Static entries are always present even if the WP fetch returns 0 posts.
        expect(body).toContain('<loc>https://keploy.io/blog</loc>');
        expect(body).toContain('<loc>https://keploy.io/blog/community</loc>');
        expect(body).toContain('<loc>https://keploy.io/blog/technology</loc>');
        expect(body).toContain('<loc>https://keploy.io/blog/integrations</loc>');
        expect(body).toContain('<loc>https://keploy.io/blog/solutions</loc>');
        expect(body).toContain('<loc>https://keploy.io/blog/case-studies</loc>');
        expect(body).toContain('<loc>https://keploy.io/blog/glossary</loc>');
    });

    test('Glossary hub route should render with canonical metadata and DefinedTermSet schema', async ({ page, baseURL }) => {
        const response = await page.goto(`${baseURL!}/glossary`);
        expect(response?.status()).toBe(200);
        await page.waitForLoadState('domcontentloaded');

        const canonical = page.locator('link[rel="canonical"]');
        await expect(canonical).toBeAttached();
        await expect(canonical).toHaveAttribute('href', 'https://keploy.io/blog/glossary');

        const schemas = page.locator('script[type="application/ld+json"]');
        const contents = await schemas.allTextContents();
        const hasDefinedTermSet = contents.some((content) => {
            try {
                const parsed = JSON.parse(content);
                return parsed?.['@type'] === 'DefinedTermSet';
            } catch {
                return false;
            }
        });

        expect(hasDefinedTermSet).toBe(true);
    });

    test('Post page article body should be in server-rendered HTML before JavaScript runs', async ({ request, baseURL }) => {
        // GPTBot / ClaudeBot / PerplexityBot fetch raw HTML without executing JS.
        // This test uses Playwright's HTTP client (no browser, no JS) to verify
        // that the article prose appears in the initial SSR payload — not only
        // inside the __NEXT_DATA__ JSON blob.
        const response = await request.get(`${baseURL!}/technology/understanding-api-testing-with-keploy`);
        expect(response.status()).toBe(200);

        const html = await response.text();

        // __NEXT_DATA__ always contains the full post JSON — strip it so we only
        // check the server-rendered DOM markup.
        const htmlWithoutNextData = html.replace(
            /<script id="__NEXT_DATA__"[\s\S]*?<\/script>/i,
            ''
        );

        // Scope the assertion to the rendered article body so title/SEO/schema
        // text cannot satisfy the check when the prose itself is missing.
        expect(htmlWithoutNextData).toMatch(
            /<div[^>]*data-testid=["']post-content["'][^>]*>[\s\S]*<p>API testing is a critical part of the software development lifecycle\.[\s\S]*<\/p>/i
        );
    });

    test('AI referral tracker should push event to dataLayer on UTM-attributed landing', async ({ page, baseURL }) => {
        await page.goto(`${baseURL!}/?utm_source=chatgpt`);

        await page.waitForFunction(() => {
            const dl = (window as any).dataLayer || [];
            return dl.some((e: any) =>
                (e?.[0] === 'event' && e?.[1] === 'ai_referral') ||
                e?.event === 'ai_referral'
            );
        }, { timeout: 10000 });
    });
});
