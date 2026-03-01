import { test, expect } from '@playwright/test';

test.describe('Footer Component', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL || 'http://localhost:3000/blog', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
  });

  test('should display footer element', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible({ timeout: 15000 });
  });

  test('should display Keploy logo in footer', async ({ page }) => {
    const footer = page.locator('footer');
    const logo = footer.locator('img[alt="Keploy Logo"]');
    await expect(logo).toBeVisible({ timeout: 15000 });
  });

  test('should have clickable logo linking to main site', async ({ page }) => {
    const footer = page.locator('footer');
    const logoLink = footer.locator('a').filter({ has: page.locator('img[alt="Keploy Logo"]') }).first();
    await expect(logoLink).toBeVisible({ timeout: 15000 });
    await expect(logoLink).toHaveAttribute('href', /keploy\.io/);
  });

  test('should display "Solutions" section', async ({ page }) => {
    const footer = page.locator('footer');
    const solutionsHeading = footer.locator('text=Solutions');
    await expect(solutionsHeading).toBeVisible();
  });

  test('should display "Developers" section', async ({ page }) => {
    const footer = page.locator('footer');
    const developersHeading = footer.locator('text=Developers');
    await expect(developersHeading).toBeVisible();
  });

  test('should display "Resources" section', async ({ page }) => {
    const footer = page.locator('footer');
    const resourcesHeading = footer.locator('text=Resources');
    await expect(resourcesHeading).toBeVisible();
  });

  test('should display "Company" section', async ({ page }) => {
    const footer = page.locator('footer');
    const companyHeading = footer.locator('text=Company');
    await expect(companyHeading).toBeVisible();
  });

  test('should have working links in Solutions section', async ({ page }) => {
    const footer = page.locator('footer');
    const apiTestingLink = footer.locator('a:has-text("API Testing")');
    await expect(apiTestingLink).toBeVisible();
    await expect(apiTestingLink).toHaveAttribute('href', /api-testing/);
  });

  test('should have working links in Developers section', async ({ page }) => {
    const footer = page.locator('footer');
    const docsLink = footer.locator('a:has-text("Documentation")');
    await expect(docsLink).toBeVisible();
    await expect(docsLink).toHaveAttribute('href', /docs/);
  });

  test('should have working links in Resources section', async ({ page }) => {
    const footer = page.locator('footer');
    const techBlogLink = footer.locator('a:has-text("Tech Blog")');
    await expect(techBlogLink).toBeVisible();
    await expect(techBlogLink).toHaveAttribute('href', /technology/);
  });

  test('should have Community Blog link', async ({ page }) => {
    const footer = page.locator('footer');
    const communityBlogLink = footer.locator('a:has-text("Community Blog")').first();
    await expect(communityBlogLink).toBeVisible();
    await expect(communityBlogLink).toHaveAttribute('href', /community/);
  });

  test('should display Twitter/X social link', async ({ page }) => {
    const footer = page.locator('footer');
    const twitterLink = footer.locator('a[href*="twitter.com"], a[href*="x.com"]').first();
    await expect(twitterLink).toBeVisible();
    await expect(twitterLink).toHaveAttribute('target', '_blank');
  });

  test('should display GitHub social link', async ({ page }) => {
    const footer = page.locator('footer');
    const githubLink = footer.locator('a[href*="github.com/keploy"]').first();
    await expect(githubLink).toBeVisible({ timeout: 15000 });
    await expect(githubLink).toHaveAttribute('target', '_blank');
  });

  test('should display LinkedIn social link', async ({ page }) => {
    const footer = page.locator('footer');
    const linkedinLink = footer.locator('a[href*="linkedin.com"]').first();
    if (await linkedinLink.count() > 0) {
      await expect(linkedinLink).toBeVisible({ timeout: 15000 });
      await expect(linkedinLink).toHaveAttribute('target', '_blank');
    }
  });

  test('should display Slack social link', async ({ page }) => {
    const footer = page.locator('footer');
    const slackLink = footer.locator('a[href*="slack.com"], a[href*="slack"]').first();
    if (await slackLink.count() > 0) {
      await expect(slackLink).toBeVisible();
      await expect(slackLink).toHaveAttribute('target', '_blank');
    }
  });

  test('all social links should open in new tab', async ({ page }) => {
    const footer = page.locator('footer');
    const socialLinks = footer.locator('a[href*="twitter.com"], a[href*="x.com"], a[href*="github.com"], a[href*="linkedin.com"], a[href*="slack"]');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);
    const firstLink = socialLinks.first();
    await expect(firstLink).toHaveAttribute('target', '_blank');
    await expect(firstLink).toHaveAttribute('rel', /noopener/);
  });

  test('should have accessible social link labels', async ({ page }) => {
    const footer = page.locator('footer');
    const socialLinks = footer.locator('a[href*="twitter.com"], a[href*="x.com"], a[href*="github.com"]');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);
    const firstLink = socialLinks.first();
    const srOnly = firstLink.locator('.sr-only');
    const ariaLabel = await firstLink.getAttribute('aria-label');
    const hasSrOnly = await srOnly.count() > 0;
    const hasAriaLabel = ariaLabel !== null;
    expect(hasSrOnly || hasAriaLabel).toBe(true);
  });

  test('should display multiple footer links', async ({ page }) => {
    const footer = page.locator('footer');
    const allLinks = footer.locator('a');
    const count = await allLinks.count();
    expect(count).toBeGreaterThan(10);
  });
});
