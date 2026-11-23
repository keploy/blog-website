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
// Hermetic: the page's third parties (GA, LinkedIn, Clarity, ...) are refused. They patch History and insertRule
// themselves, which would blur what the SDK did, and an e2e run must not report page views to their accounts.
test.beforeEach(async ({ context, baseURL }) => {
  const own = new Set([new URL(baseURL!).hostname, new URL(STUB).hostname]);
  await context.route(
    (url) => !own.has(url.hostname),
    (route) => route.abort(),
  );
});

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
 * What a running capture replaces in the page: the SDK wraps fetch, XMLHttpRequest and the History API, and rrweb's
 * recorder patches CSSStyleSheet.insertRule. recordNatives keeps the browser's own, before any page script runs;
 * patchedNatives names those the page no longer has.
 */
const NATIVES = ['fetch', 'xhrOpen', 'xhrSend', 'pushState', 'insertRule'] as const;
async function recordNatives(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __uicNatives: Record<string, unknown> }).__uicNatives = {
      fetch: window.fetch,
      xhrOpen: XMLHttpRequest.prototype.open,
      xhrSend: XMLHttpRequest.prototype.send,
      pushState: History.prototype.pushState,
      insertRule: CSSStyleSheet.prototype.insertRule,
    };
  });
}
async function patchedNatives(page: Page): Promise<string[]> {
  return page.evaluate((names) => {
    const kept = (window as unknown as { __uicNatives: Record<string, unknown> }).__uicNatives;
    const now: Record<string, unknown> = {
      fetch: window.fetch,
      xhrOpen: XMLHttpRequest.prototype.open,
      xhrSend: XMLHttpRequest.prototype.send,
      pushState: history.pushState,
      insertRule: CSSStyleSheet.prototype.insertRule,
    };
    return names.filter((n) => now[n] !== kept[n]);
  }, [...NATIVES]);
}
// rrweb Meta (type 4) carries the page URL the SDK recorded; so does each batch's metadata.
const pageUrlsOf = (batches: Batch[]) => [
  ...batches.map((b) => b.body.metadata?.url).filter((u): u is string => typeof u === 'string'),
  ...eventsOf(batches)
    .map((e) => (rrweb(e)?.type === 4 ? (rrweb(e)?.data as { href?: string } | undefined)?.href : undefined))
    .filter((u): u is string => typeof u === 'string'),
];

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
    await recordNatives(page);
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
    // The SDK's first post: it is recording, so the typing and the call below are recorded (it starts once the page
    // is idle; WebKit has no requestIdleCallback, so there it starts on a timer).
    await posted;
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

    // While it records, the capture has replaced what the signal tests below require untouched.
    expect(await patchedNatives(page), 'a running capture wraps fetch, XMLHttpRequest and History, and rrweb patches insertRule').toEqual([
      ...NATIVES,
    ]);
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

  // honorPrivacySignals: the SDK declines such a browser in init(), before it loads rrweb or patches anything, and
  // says so once per page with a console.info line naming the signal. Judged by that cause, then by its effects.
  for (const signal of ['Do Not Track', 'Global Privacy Control'] as const) {
    test(`a browser that sends ${signal} is not recorded`, async ({ page, baseURL, marker }) => {
      await recordNatives(page);
      await page.addInitScript((which) => {
        if (which === 'Do Not Track') Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' });
        else Object.defineProperty(navigator, 'globalPrivacyControl', { get: () => true });
      }, signal);
      const ingestRequests: string[] = [];
      page.on('request', (r) => {
        if (r.url().startsWith(INGEST)) ingestRequests.push(`${r.method()} ${r.url()}`);
      });
      // A declined visitor is not a failure: neither the SDK nor the blog's component may warn or err about it.
      const complaints: string[] = [];
      page.on('console', (m) => {
        if (['warning', 'error'].includes(m.type()) && /\[keploy\]|Keploy UI capture/.test(m.text())) complaints.push(`${m.type()}: ${m.text()}`);
      });
      // Whichever comes first: the SDK's decline line, or a post of its to the ingest (it recorded this browser).
      const declined = page.waitForEvent('console', {
        predicate: (m) => m.text().includes('KUI_E_CAPTURE_DECLINED'),
        timeout: 30_000,
      });
      const recorded = page
        .waitForRequest((r) => r.url() === INGEST, { timeout: 30_000 })
        .then(() => Promise.reject(new Error(`the SDK posted to the ingest: it recorded a browser that sends ${signal}`)));
      declined.catch(() => undefined);
      recorded.catch(() => undefined);
      await page.goto(`${baseURL}/technology`);
      const message = await Promise.race([declined, recorded]);
      expect(message.type(), 'the SDK says it declined, as information').toBe('info');
      expect(message.text(), 'naming the signal it honoured').toContain(`the browser sent ${signal}`);
      await openPost(page, page.locator('a[href*="/technology/"]').first());
      // The page's own call, after the decline, goes out as it would without the SDK.
      const status = await page.evaluate(async (url) => (await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, PROBE);
      expect(status).toBe(200);
      expect(await patchedNatives(page), 'fetch, XMLHttpRequest, History and rrweb\'s hooks untouched').toEqual([]);
      expect(ingestRequests, 'nothing was posted to the ingest').toEqual([]);
      expect(complaints, 'no warning or error about the decline').toEqual([]);
      expect(await batchesOf(page, marker), 'and the ingest holds nothing of this browser').toEqual([]);
    });
  }

  test('strict mode records every query value as [REDACTED], names kept, in the page URL and in a call', async ({
    page,
    baseURL,
    marker,
  }) => {
    const value = `qv-${marker}`;
    const posted = page.waitForResponse((r) => r.url() === INGEST && r.request().method() === 'POST' && r.ok(), {
      timeout: 30_000,
    });
    posted.catch(() => undefined);
    await page.goto(`${baseURL}/technology/understanding-api-testing-with-keploy?utm_source=${value}&ref=2`);
    // The sidebar's share links strip query/hash from the post URL.
    const shareX = page.locator('a[aria-label="Share on X"]').first();
    await expect(shareX).toBeVisible();
    const shareHref = (await shareX.getAttribute('href')) ?? '';
    expect(shareHref, 'share link points at the clean post path').toContain('understanding-api-testing-with-keploy');
    expect(shareHref, 'share link drops query parameters').not.toContain('utm_source');
    expect(shareHref, 'share link drops the query value').not.toContain(value);
    // The SDK's first post: it is recording, so the call below is recorded.
    await posted;
    await page.evaluate(async (url) => {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    }, `${PROBE}?q=${value}&ref=2`);
    await expect
      .poll(
        async () =>
          eventsOf(await batchesOf(page, marker))
            .filter((e) => e.type === 'network')
            .map((e) => (e.data as { url?: string }).url ?? '')
            .filter((u) => u.startsWith(PROBE)),
        { message: 'the call is recorded with each query value redacted and its names kept', timeout: 30_000 },
      )
      .toEqual([`${PROBE}?q=[REDACTED]&ref=[REDACTED]`]);
    const batches = await batchesOf(page, marker);
    const pageUrls = pageUrlsOf(batches).filter((u) => u.includes('utm_source'));
    expect(pageUrls.length, 'the page URL is recorded').toBeGreaterThan(0);
    for (const u of pageUrls) expect(u, 'the page URL keeps the names, not the values').toContain("?utm_source=[REDACTED]&ref=[REDACTED]");
    expect(JSON.stringify(batches), 'the query value is nowhere in the session').not.toContain(value);
  });

  // Neither what a visitor arrives with in /search?q= nor what they type into /community/search may appear in the
  // recorded session (both pages keep visitor queries out of <head>, and strict mode blanks text attributes as well).
  test('what a visitor searches for is not recorded', async ({ page, baseURL, marker }) => {
    const arrived = `searched-${marker}`;
    const typed = `typedsearch-${marker}`;
    const firstPost = () => {
      const p = page.waitForResponse((r) => r.url() === INGEST && r.request().method() === 'POST' && r.ok(), { timeout: 30_000 });
      p.catch(() => undefined);
      return p;
    };
    // A search the visitor arrives with, in the URL.
    const posted = firstPost();
    await page.goto(`${baseURL}/search?q=${arrived}`);
    await posted;
    // One typed into the community search, then a call of the page's own after it: once that call is at the ingest,
    // everything recorded before it (the typing and what it changed in the page) is there too.
    await page.goto(`${baseURL}/community/search`);
    // Recording this document: its URL is in the session (leaving /search flushes that page's last batch on the way
    // out, so the next post alone does not say this page is recorded).
    await expect
      .poll(async () => pageUrlsOf(await batchesOf(page, marker)).some((u) => u.includes('/community/search')), {
        message: 'the community search page is being recorded',
        timeout: 30_000,
      })
      .toBe(true);
    await page.getByPlaceholder('Search Community posts...').fill(typed);
    await page.evaluate(async (url) => {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    }, `${PROBE}?after=search`);
    await expect
      .poll(
        async () => {
          const events = eventsOf(await batchesOf(page, marker));
          return {
            input: events.some((e) => inputText(e) !== undefined),
            call: events.some((e) => e.type === 'network' && ((e.data as { url?: string }).url ?? '').startsWith(`${PROBE}?after=`)),
          };
        },
        { message: 'the typing and the later call are at the ingest', timeout: 30_000 },
      )
      .toEqual({ input: true, call: true });
    const recorded = JSON.stringify(await batchesOf(page, marker));
    expect.soft(recorded, 'the search the visitor arrived with was recorded').not.toContain(arrived);
    expect.soft(recorded, 'the search the visitor typed was recorded').not.toContain(typed);
  });

  test('an ingest outage does not break the page', async ({ page, baseURL }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    // The ingest answers every post of the SDK with a 503.
    let refused = 0;
    await page.route(INGEST, async (route) => {
      if (route.request().method() === 'POST') refused += 1;
      await route.fulfill({ status: 503, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' }, body: 'down' });
    });
    await page.goto(`${baseURL}/technology`);
    await expect.poll(() => refused, { message: 'the SDK posted, and the ingest refused it', timeout: 30_000 }).toBeGreaterThan(0);
    // The page still navigates, renders and makes its own calls, while the SDK backs off.
    await openPost(page, page.locator('a[href*="/technology/"]').first());
    await expect(page.locator('h1').first()).toBeVisible();
    const status = await page.evaluate(
      async (url) => (await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status,
      PROBE,
    );
    expect(status).toBe(200);
    expect(errors, 'no uncaught error in the page').toEqual([]);
  });
});
