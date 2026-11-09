import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Follow an in-site link and return once the page it leads to is on screen:
 * its URL is committed and `ready` (something only that page renders) is
 * visible.
 *
 * Links here are next/link, a client-side route change: the document never
 * reloads, so `waitForLoadState` after the click returns at once. The router
 * commits the new URL only after it has fetched the route's data, and renders
 * the page after that. Tests that carried on after a load-state wait raced
 * that route change: a reload landed back on the index (LeadCapture's
 * fail-open test then never found the newsletter form, which only post pages
 * render), and one-shot reads mixed the index with the post (PostBody's
 * table-of-contents test counted the TOC on the index and the headings on the
 * post).
 */
export async function openLink(page: Page, link: Locator, ready: Locator): Promise<void> {
  await expect(link).toBeVisible({ timeout: 15000 });
  await expect(link).toBeEnabled();
  const href = await link.getAttribute('href');
  expect(href, 'the link has an href').toBeTruthy();
  const path = new URL(href!, page.url()).pathname;
  await link.click();
  await page.waitForURL((url) => url.pathname === path, { timeout: 15000, waitUntil: 'commit' });
  await expect(ready).toBeVisible({ timeout: 15000 });
}

/** Open a blog post from a link to it; ready once the post's content is on screen. */
export async function openPost(page: Page, link: Locator): Promise<void> {
  await openLink(page, link, page.getByTestId('post-content'));
}
