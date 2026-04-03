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
        await expect(ogDesc).toHaveAttribute('content', /Blog from the Technology Page/);
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
