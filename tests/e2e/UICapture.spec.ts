import { test as base, expect, type Page, type TestInfo } from '@playwright/test';
import { openPost } from '../support/openLink';

/**
 * Keploy UI capture on the blog, end to end against the mock server's ingest
 * stub (tests/mock-server.js; the e2e build points the SDK there, see
 * playwright.config.ts). Every other spec records too; this one checks that a
 * visit arrives as a session and that the strict mode the blog records in
 * keeps what it promises.
 *
 * Each test's browser carries a user agent of its own, the one thing the SDK
 * reports that page-URL scrubbing does not touch, and the stub returns the
 * sessions that carry it.
 */

const STUB = new URL('/', process.env.PLAYWRIGHT_GRAPHQL_URL || 'http://localhost:4000/graphql').origin;
const INGEST = `${STUB}/ui/v1/ingest`;
// A path only this test calls (the stub answers any POST under /ui/v1/), so
// the recorded call is the probe's and not, say, the navbar's own /graphql.
const PROBE = `${STUB}/ui/v1/probe`;
const markerOf = (testInfo: TestInfo) => `uic-e2e-${testInfo.testId}-${testInfo.repeatEachIndex}-${testInfo.retry}`;

const test = base.extend<{ marker: string }>({
  marker: async ({}, use, testInfo) => use(markerOf(testInfo)),
  userAgent: async ({}, use, testInfo) => use(`Mozilla/5.0 (X11; Linux x86_64) ${markerOf(testInfo)}`),
});
test.use({ viewport: { width: 1600, height: 1000 } });

type SessionEvent = { type?: string; data?: unknown };
interface Batch {
  apiKey: string | null;
  body: { sessionId?: string; metadata?: { userAgent?: string; url?: string } | null; events?: SessionEvent[] };
}

async function batchesOf(page: Page, marker: string): Promise<Batch[]> {
  return (await (await page.request.get(`${STUB}/ui/v1/_received?ua=${encodeURIComponent(marker)}`)).json()) as Batch[];
}
const eventsOf = (batches: Batch[]) => batches.flatMap((b) => b.body.events ?? []);
// rrweb, inside a 'dom' event: type 2 = FullSnapshot; type 3 + source 5 = an Input.
const rrweb = (e: SessionEvent) => (e.type === 'dom' ? (e.data as { type?: number; data?: { source?: number; text?: string } }) : undefined);
const isFullSnapshot = (e: SessionEvent) => rrweb(e)?.type === 2;
const inputText = (e: SessionEvent) => (rrweb(e)?.type === 3 && rrweb(e)?.data?.source === 5 ? rrweb(e)?.data?.text : undefined);

/**
 * The first visible text node of the page with a few words in it, outside
 * <script>, <style> and <noscript> and not repeated in any attribute: plain
 * page text, as rrweb serialises it (an element's textContent can include a
 * <style> block's CSS).
 */
async function firstPlainText(page: Page): Promise<string> {
  return page.evaluate(() => {
    // Attribute values (aria-label, title, alt) are recorded in every mode, so
    // text that also appears in one cannot show whether text nodes are masked.
    const attributes = Array.from(document.querySelectorAll('*'))
      .flatMap((el) => Array.from(el.attributes, (a) => a.value))
      .join('\n');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        const text = (node.textContent ?? '').trim();
        const visible = parent.getClientRects().length > 0;
        return visible && !attributes.includes(text) && text.length >= 20 && text.length <= 200 && /[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(text)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    });
    return (walker.nextNode()?.textContent ?? '').trim();
  });
}

test.describe('Keploy UI capture (strict)', () => {
  test('a visit arrives at the ingest as a session, with no typed text and no bodies', async ({ page, baseURL, marker }) => {
    const typed = `typed-${marker}`;
    const sent = `sent-${marker}`;
    // Armed before anything happens: the SDK's first post of its own to the
    // ingest (it posts once a page is idle, then on its flush interval). The
    // poll below is what waits for this test's own events.
    const posted = page.waitForResponse((r) => r.url() === INGEST && r.request().method() === 'POST' && r.ok(), {
      timeout: 30_000,
    });
    // Awaited below; handled now so a failure before then is not unhandled.
    posted.catch(() => undefined);
    await page.goto(`${baseURL}/technology`);
    await openPost(page, page.locator('a[href*="/technology/"]').first());
    const plainText = await firstPlainText(page);
    const name = page.locator('form', { has: page.getByPlaceholder('Full Name') }).first().getByPlaceholder('Full Name');
    await name.scrollIntoViewIfNeeded();
    await name.fill(typed);
    // A call of the page's own, with a body that must not be recorded.
    await page.evaluate(
      async ({ url, body }) => {
        await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      },
      { url: PROBE, body: JSON.stringify({ sent }) },
    );

    await posted;
    // Then for the session, its full snapshot, the typing (as an Input event)
    // and the probe call, all at the ingest.
    await expect
      .poll(
        async () => {
          const events = eventsOf(await batchesOf(page, marker));
          return {
            snapshot: events.some(isFullSnapshot),
            input: events.some((e) => inputText(e) !== undefined),
            call: events.some((e) => e.type === 'network' && (e.data as { url?: string }).url === PROBE),
          };
        },
        { message: 'the ingest received the session, its snapshot, the typing and the call', timeout: 30_000 },
      )
      .toEqual({ snapshot: true, input: true, call: true });

    const batches = await batchesOf(page, marker);
    expect(batches.every((b) => b.apiKey === 'kep_e2e_ingest_stub'), 'every batch carries the ingest key').toBe(true);
    const inputs = eventsOf(batches).map(inputText).filter((t): t is string => t !== undefined);
    expect(inputs.every((t) => /^\*+$/.test(t)), `typed text is masked: ${JSON.stringify(inputs)}`).toBe(true);
    expect(JSON.stringify(batches), 'typed text never leaves the browser').not.toContain(typed);
    // Strict: visible text is masked. A plain text node the post rendered is
    // nowhere in the session, and the snapshot holds masked text instead.
    expect(plainText.length).toBeGreaterThanOrEqual(20);
    expect(JSON.stringify(batches), `the page's text "${plainText}" was recorded`).not.toContain(JSON.stringify(plainText).slice(1, -1));
    expect(JSON.stringify(batches), 'the same text, masked, is there instead').toContain(JSON.stringify(plainText.replace(/\S/g, '*')).slice(1, -1));
    expect(JSON.stringify(batches), 'a request body never leaves the browser').not.toContain(sent);
    const bodiesOf = (events: SessionEvent[]) =>
      events
        .filter((e) => e.type === 'network')
        .flatMap((e) => {
          const n = e.data as { requestBody?: string | null; responseBody?: string | null };
          return [n.requestBody, n.responseBody];
        })
        .filter((body) => body != null);
    const probe = eventsOf(batches).filter((e) => e.type === 'network' && (e.data as { url?: string }).url === PROBE);
    expect(bodiesOf(probe), 'the probe was recorded with both of its bodies, masked').toEqual(['[MASKED]', '[MASKED]']);
    expect(bodiesOf(eventsOf(batches)).filter((body) => body !== '[MASKED]'), 'no request or response body is recorded').toEqual([]);
  });

  // FIXME until the SDK release (honorPrivacySignals, on by default): the SDK
  // this branch is tested with honours neither signal. These become real tests
  // at the bump to that release; there is no check of our own to stand in.
  for (const signal of ['Do Not Track', 'Global Privacy Control'] as const) {
    test.fixme(`a browser that sends ${signal} is not recorded`, async ({ page, baseURL, marker }) => {
      await page.addInitScript((which) => {
        if (which === 'Do Not Track') Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' });
        else Object.defineProperty(navigator, 'globalPrivacyControl', { get: () => true });
      }, signal);
      await page.goto(`${baseURL}/technology`);
      await openPost(page, page.locator('a[href*="/technology/"]').first());
      // An absence: an idle start plus two flush intervals, had it started.
      // Replace with the SDK's refusal signal once the release names it.
      await page.waitForTimeout(15_000);
      expect(await batchesOf(page, marker)).toEqual([]);
    });
  }

  // FIXME until the SDK release whose strict mode redacts every query value
  // (keys kept). Remove the fixme with the bump to that release.
  test.fixme('strict mode keeps query values out of the recorded page URL', async ({ page, baseURL, marker }) => {
    const value = `qv-${marker}`;
    await page.goto(`${baseURL}/technology?utm_source=${value}`);
    await expect.poll(async () => (await batchesOf(page, marker)).length, { timeout: 30_000 }).toBeGreaterThan(0);
    const recorded = JSON.stringify(await batchesOf(page, marker));
    expect(recorded).toContain('utm_source');
    expect(recorded).not.toContain(value);
  });
});
