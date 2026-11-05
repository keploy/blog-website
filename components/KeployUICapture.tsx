import { useEffect } from 'react';

/*
 * keploy.io/blog recorded with Keploy's own UI capture, in its strictest form.
 *
 * Off unless NEXT_PUBLIC_KEPLOY_UI_CAPTURE_API_KEY is set (a UI ingest key of
 * the Keploy app that receives the blog's sessions); set it only in the
 * deployment's environment. NEXT_PUBLIC_KEPLOY_UI_CAPTURE_ENDPOINT overrides
 * the ingest endpoint; next.config.js adds its origin to connect-src, and on
 * Vercel vercel.json's CSP must allow it too (it allows https://api.keploy.io).
 *
 * Strict: every typed value and every visible text node is masked, and network
 * calls are recorded without their request or response bodies. Not recording
 * a browser that sends Do Not Track or Global Privacy Control, and redacting
 * query values in strict mode, come with the SDK release this waits for (the
 * published 3.0.1 has neither): do not set the key before that bump. It is
 * loaded after the page has gone idle, so it never competes with the page's
 * own first load.
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
