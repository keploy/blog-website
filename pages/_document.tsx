import { Html, Head, Main, NextScript } from "next/document";
import { getOrganizationSchema, getBlogSchema } from "../lib/structured-data";
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
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Telemetry SDK is loaded in _app.tsx only — removed duplicate here */}
      </body>
    </Html>
  );
}
