import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import { getOrganizationSchema, getBlogSchema } from '../lib/structured-data';

export default function Document() {
  const organizationSchema = getOrganizationSchema();
  const blogSchema = getBlogSchema();

  return (
    <Html lang="en">
      <Head>
        {/* Organization Schema — single source from lib/structured-data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Blog Schema — single source from lib/structured-data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blogSchema),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script
          id="keploy-telemetry-sdk"
          src="https://telemetry.keploy.io/sessions/sdk.js"
          data-endpoint="https://telemetry.keploy.io/sessions/collect"
          data-source="blog"
          strategy="lazyOnload"
        />
      </body>
    </Html>
  );
}
