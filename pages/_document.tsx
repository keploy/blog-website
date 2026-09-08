import { Html, Head, Main, NextScript } from "next/document";
import {
  getOrganizationSchema,
  getBlogSchema,
  getSoftwareApplicationSchema,
} from "../lib/structured-data";
import { safeJsonLdStringify } from "../utils/seo";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
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
        {/* SoftwareApplication (Keploy) — global node with a stable @id that
            every article's `mentions` links back to (AI-citation entity anchor) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(getSoftwareApplicationSchema()),
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
