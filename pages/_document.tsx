import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import { getOrganizationSchema, getBlogSchema } from "../lib/structured-data";
import { safeJsonLdStringify } from "../utils/seo";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* GA4 — beforeInteractive so analytics loads as early as the site does
            (captures the earliest pageviews). beforeInteractive scripts live in
            _document per Next.js. Clarity/Apollo stay deferred in layout.tsx. */}
        <Script
          id="gtag-loader"
          src="https://www.googletagmanager.com/gtag/js?id=G-GYS09X6KHS"
          strategy="beforeInteractive"
        />
        <Script
          id="google-ga"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GYS09X6KHS');
        `,
          }}
        />
        {/* Organization Schema — single source from lib/structured-data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(getOrganizationSchema()),
          }}
        />
        {/* Blog Schema — single source from lib/structured-data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(getBlogSchema()),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Telemetry SDK is loaded in _app.tsx only — removed duplicate here */}
      </body>
    </Html>
  );
}
