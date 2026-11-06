import { useEffect, useState } from "react";
import { Post } from "../types/post";
import Alert from "./alert";
import Footer from "./footer";
import Meta from "./meta";
import Script from "next/script";
import ScrollToTop from "./ScrollToTop";

export default function Layout({
  preview,
  children,
  featuredImage,
  Title,
  Description,
  structuredData = [],
  canonicalUrl,
  ogType = "website",
  publishedDate,
}: {
  preview: any;
  Description: any;
  featuredImage: Post["featuredImage"]["node"]["sourceUrl"];
  Title: Post["title"];
  children: React.ReactNode;
  structuredData?: Record<string, unknown>[];
  canonicalUrl?: string;
  ogType?: "article" | "website";
  publishedDate?: string;
}) {
  // Load Clarity only after the first user interaction (not on page load) — it's
  // a heavy session-recording script, so keep it off the initial load path.
  const [interacted, setInteracted] = useState(false);
  useEffect(() => {
    const events = ["scroll", "pointerdown", "keydown", "touchstart"];
    const onInteract = () => setInteracted(true);
    events.forEach((e) => window.addEventListener(e, onInteract, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, onInteract));
  }, []);

  return (
    <>
      <Meta
        featuredImage={featuredImage}
        Title={Title}
        Description={Description}
        structuredData={structuredData}
        canonicalUrl={canonicalUrl}
        ogType={ogType}
        publishedDate={publishedDate}
      />
      {/* Replaced the Layout wrapper's framer-motion animation with a CSS
          animation so this fade-in no longer depends on framer-motion here.
          The effect is now handled by a pure CSS @keyframes animation. */}
      <div
        className="min-h-screen animate-[fadeIn_0.3s_ease-out] motion-reduce:animate-none"
      >
        {/* <Alert preview={preview} /> */}
        <main className="layout-content-padded">{children}</main>
      </div>
      <Footer />
      <ScrollToTop />

      {/* ── Analytics & third-party scripts ──
           GA4 uses afterInteractive: it fires right after hydration (not the
           idle-wait of lazyOnload), so we don't lose early pageviews, while
           staying off the pre-hydration critical path so it doesn't compete
           with LCP. Clarity loads on first interaction; Apollo + SWG stay
           lazyOnload. */}

      <Script
        id="gtag-loader"
        src="https://www.googletagmanager.com/gtag/js?id=G-GYS09X6KHS"
        strategy="afterInteractive"
      />
      <Script
        id="google-ga"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GYS09X6KHS');
        `,
        }}
      />

      {/* Microsoft Clarity — mounted only after the first user interaction. */}
      {interacted && (
        <Script
          id="msclarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","jymj0ktwcp");
        `,
          }}
        />
      )}

      {/* Google News SWG (Subscribe with Google) — lazyOnload, non-critical. */}
      <Script
        id="swg-basic"
        src="https://news.google.com/swg/js/v1/swg-basic.js"
        strategy="lazyOnload"
      />
      <Script
        id="publisher"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
              (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
                  basicSubscriptions.init({
                    type: "NewsArticle",
                    isPartOfType: ["Product"],
                    isPartOfProductId: "CAowiLC8DA:openaccess",
                    clientOptions: { theme: "light", lang: "en" },
                  });
                });
            `,
        }}
      />

      {/* Apollo Tracking Script — lazyOnload */}
      <Script
        id="apollo-tracker"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            function initApollo() {
              var n = Math.random().toString(36).substring(7);
              var o = document.createElement("script");
              o.src = "https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=" + n;
              o.async = true;
              o.defer = true;
              o.onload = function() {
                window.trackingFunctions.onLoad({ appId: "6644a0d6a54b5b0438c841cc" });
              };
              document.head.appendChild(o);
            }
            initApollo();
          `,
        }}
      />
    </>
  );
}
