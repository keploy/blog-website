import { useEffect, useRef } from "react";
import Router from "next/router";
import Script from "next/script";

// LinkedIn Insight Tag (website retargeting + conversion tracking).
//
// 3176938 is the Insight Tag of the Keploy ad account, the same id keploy.io and
// keploy.io/docs ship, so blog readers join the same retargeting audiences
// (every audience rule is "URL starts with https://keploy.io", which /blog
// matches). Public value: it appears verbatim in the page source of every site
// that runs the tag, so it is not a secret and lives here like the GA id does.
//
// Rendered only on production deployments: `next dev` is excluded by NODE_ENV,
// and Vercel previews (which also build with NODE_ENV=production) by
// NEXT_PUBLIC_VERCEL_ENV. Preview hits would match no audience rule (their
// *.vercel.app URLs never start with https://keploy.io) but would still show up
// in the shared ad account's Insight Tag stats, so they are kept out. The check
// is an exclusion rather than `=== "production"` on purpose: a build where
// Vercel's system env vars are not exposed leaves the variable unset, and the
// tag must still ship there.
//
// Loaded with lazyOnload: the tag pulls ~62 KB of LinkedIn JS, and a
// retargeting pixel is lower priority than the page settling (same strategy as
// the telemetry SDK in _app.tsx). A visitor who leaves before `load` is not
// counted, which is fine for retargeting.
//
// insight.min.js records the first page view itself. The blog is a pages-router
// SPA, so client-side navigations never reload the document; the Router
// listener below re-fires a page view on each completed route change (the
// `typeof lintrk` guard makes it a no-op for navigations before the tag loads).
const LINKEDIN_PARTNER_ID = "3176938";

type LintrkFn = ((action: string, payload?: Record<string, unknown>) => void) & {
  q?: unknown[][];
};

declare global {
  interface Window {
    lintrk?: LintrkFn;
    _linkedin_data_partner_ids?: string[];
  }
}

function LinkedInInsightRouteTracker() {
  const lastTrackedUrlRef = useRef<string>("");

  useEffect(() => {
    const onRouteChangeComplete = (url: string) => {
      if (lastTrackedUrlRef.current === url) return;
      lastTrackedUrlRef.current = url;
      // Once the snippet has run, lintrk is a queueing stub, so calls made
      // before insight.min.js downloads are kept. Before the snippet runs
      // (lazyOnload, so until after `load`) there is no lintrk and the
      // navigation is dropped; the tag's own first page view covers whatever
      // page is open when it loads.
      if (typeof window.lintrk === "function") window.lintrk("track");
    };
    Router.events.on("routeChangeComplete", onRouteChangeComplete);
    return () => {
      Router.events.off("routeChangeComplete", onRouteChangeComplete);
    };
  }, []);

  return null;
}

const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;

export default function LinkedInInsightScript() {
  if (process.env.NODE_ENV !== "production") return null;
  if (VERCEL_ENV === "preview" || VERCEL_ENV === "development") return null;

  return (
    <>
      <Script id="linkedin-insight-base" strategy="lazyOnload">
        {`
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push("${LINKEDIN_PARTNER_ID}");
          (function(l) {
            if (!l) {
              window.lintrk = function(a, b) { window.lintrk.q.push([a, b]); };
              window.lintrk.q = [];
            }
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";
            b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
          })(window.lintrk);
        `}
      </Script>
      <LinkedInInsightRouteTracker />
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" alt="" src="https://px.ads.linkedin.com/collect/?pid=${LINKEDIN_PARTNER_ID}&fmt=gif" />`,
        }}
      />
    </>
  );
}
