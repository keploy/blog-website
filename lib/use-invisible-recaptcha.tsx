import { useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      };
    };
  }
}

/** How long to wait for the reCAPTCHA script before failing open (ms). */
const CAPTCHA_WATCHDOG_MS = 10000;
/** Ceiling on a single execute() call — a hung call must not strand the lead (ms). */
const EXECUTE_TIMEOUT_MS = 5000;

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/**
 * Invisible score-based reCAPTCHA Enterprise, mirroring the landing repo's
 * ReportGate flow: tokens are minted at submit time via
 * grecaptcha.enterprise.execute() and verified server-side by the telemetry
 * service. Everything fails OPEN — a blocked or broken captcha never blocks
 * the visitor's action; the lead is simply sent with an empty token and
 * rejected server-side (visible in telemetry logs).
 *
 * The badge is hidden globally (styles/index.css), which Google's terms
 * permit only when the "Protected by reCAPTCHA" attribution is shown next
 * to the form — render `RecaptchaAttribution` there.
 *
 * Render the returned `script` element while the host form is mounted.
 */
export function useInvisibleRecaptcha(active: boolean) {
  const [scriptReady, setScriptReady] = useState(false);
  const [captchaFailed, setCaptchaFailed] = useState(false);

  // On re-navigation the script may already be in the window before this
  // hook's Script element mounts (next/script re-fires onReady on remount,
  // but only after mount) — recover the ready state immediately.
  useEffect(() => {
    if (active && !scriptReady && window.grecaptcha?.enterprise) setScriptReady(true);
  }, [active, scriptReady]);

  // Fail-open watchdog: Script onError only fires for outright load failures.
  // A stalled request or blocked follow-up resources would otherwise never
  // resolve. If the script actually arrived but onReady was swallowed,
  // recover instead of failing.
  useEffect(() => {
    if (!active || !RECAPTCHA_SITE_KEY || scriptReady || captchaFailed) return;
    const timer = setTimeout(() => {
      if (window.grecaptcha?.enterprise) setScriptReady(true);
      else setCaptchaFailed(true);
    }, CAPTCHA_WATCHDOG_MS);
    return () => clearTimeout(timer);
  }, [active, scriptReady, captchaFailed]);

  // Mint a token invisibly; resolve '' on any failure or hang (fail open).
  // Checks the live window rather than captchaFailed: if the script arrived
  // after the watchdog latched, a real token is still mintable.
  const getToken = (action: string): Promise<string> => {
    const enterprise = window.grecaptcha?.enterprise;
    if (!RECAPTCHA_SITE_KEY || !enterprise) return Promise.resolve('');
    return new Promise<string>((resolve) => {
      const timer = setTimeout(() => resolve(''), EXECUTE_TIMEOUT_MS);
      const settle = (token: string) => {
        clearTimeout(timer);
        resolve(token);
      };
      try {
        enterprise.ready(() => {
          enterprise
            .execute(RECAPTCHA_SITE_KEY, { action })
            .then(settle)
            .catch(() => settle(''));
        });
      } catch {
        settle('');
      }
    });
  };

  const script =
    active && RECAPTCHA_SITE_KEY ? (
      <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setCaptchaFailed(true)}
      />
    ) : null;

  return { script, getToken, scriptReady, captchaFailed };
}

/** Required whenever the badge is hidden (Google's terms). */
export function RecaptchaAttribution() {
  if (!RECAPTCHA_SITE_KEY) return null;
  return (
    <span className="text-xs text-gray-400 block text-center">
      Protected by reCAPTCHA &mdash;{' '}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
        Privacy
      </a>
      {' & '}
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
        Terms
      </a>
    </span>
  );
}
