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
// Rendered only in production builds so `next dev` stays quiet. Vercel
// previews build as production too; their *.vercel.app URLs match no audience
// rule, so preview hits never land in an audience.
//
// insight.min.js records the first page view itself. The blog is a pages-router
// SPA, so client-side navigations never reload the document; the Router
// listener below re-fires a page view on each completed route change.
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
      // The inline snippet defines a queueing stub for lintrk before the real
      // script downloads, so this call is never lost once the tag is mounted.
      if (typeof window.lintrk === "function") window.lintrk("track");
    };
    Router.events.on("routeChangeComplete", onRouteChangeComplete);
    return () => {
      Router.events.off("routeChangeComplete", onRouteChangeComplete);
    };
  }, []);

  return null;
}

export default function LinkedInInsightScript() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script id="linkedin-insight-base" strategy="afterInteractive">
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
