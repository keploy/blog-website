import { useEffect } from 'react';

/*
 * keploy.io/blog recorded with Keploy's own UI capture, in its strictest form.
 *
 * Off unless NEXT_PUBLIC_KEPLOY_UI_CAPTURE_API_KEY is set (a UI ingest key of
 * the Keploy app that receives the blog's sessions); set it only in the Vercel
 * project's Production environment, never in a committed file: a preview
 * deployment with it would record into the production app.
 * NEXT_PUBLIC_KEPLOY_UI_CAPTURE_ENDPOINT overrides
 * the ingest endpoint; next.config.js adds its origin to connect-src, and on
 * Vercel vercel.json's CSP must allow it too (it allows https://api.keploy.io).
 *
 * Strict: every typed value and every visible text node is masked, non-structural
 * text attributes (title, alt, aria-*, data-*, <meta> content) are blanked by the
 * SDK's strict allow-list, network calls are recorded without their request or
 * response bodies, and every query value (in the page URL, URL-valued attributes
 * and each call's URL) is recorded as [REDACTED], names kept. Strict still keeps
 * URL paths and structural attributes (id, class, data-testid, name), so pages
 * must still never copy visitor input into <head>, share URLs or DOM attributes.
 * A browser that sends Do Not Track or Global Privacy Control is not recorded at
 * all: the SDK loads no recorder, patches nothing and sends nothing
 * (honorPrivacySignals, set here rather than left to the SDK's default; it says
 * so with one console.info line). Requires @keploy/capture-sdk 3.2.0. It is
 * loaded after the page has gone idle, so it never competes with the page's own
 * first load.
 */
export const DEFAULT_UI_CAPTURE_ENDPOINT = 'https://api.keploy.io/ui/v1/ingest';

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function KeployUICapture(): null {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KEPLOY_UI_CAPTURE_API_KEY ?? '';
    if (!apiKey) return undefined;
    const endpoint = process.env.NEXT_PUBLIC_KEPLOY_UI_CAPTURE_ENDPOINT || DEFAULT_UI_CAPTURE_ENDPOINT;
    let cancelled = false;
    let stop: (() => void) | undefined;

    const start = () => {
      import('@keploy/capture-sdk')
        .then(async ({ KeployCapture }) => {
          if (cancelled) return;
          await KeployCapture.init({
            endpoint,
            apiKey,
            privacyMode: 'strict',
            privacy: { maskNetworkBodies: true },
            honorPrivacySignals: true,
            sampleRate: 1,
          });
          const stopCapture = () => {
            KeployCapture.stop().catch((err: unknown) => console.warn('Keploy UI capture did not stop cleanly:', err));
          };
          if (cancelled) {
            stopCapture();
            return;
          }
          stop = stopCapture;
        })
        .catch((err: unknown) => {
          // Recording must never break the page, but a capture that could not
          // start (a chunk that failed to load, a rejected init) is said.
          console.warn('Keploy UI capture did not start:', err);
        });
    };

    const w = window as IdleWindow;
    const idle = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 5000 }) : undefined;
    const timer = idle === undefined ? window.setTimeout(start, 2000) : undefined;
    return () => {
      cancelled = true;
      if (idle !== undefined) w.cancelIdleCallback?.(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      stop?.();
    };
  }, []);
  return null;
}
