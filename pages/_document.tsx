import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import {
  getOrganizationSchema,
  SITE_URL,
  ORG_NAME,
  MAIN_SITE_URL,
} from '../lib/structured-data';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Organization Schema — single source from lib/structured-data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema())
          }}
        />

        {/* Blog Schema — uses shared constants */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": `${ORG_NAME} Blog`,
              "url": SITE_URL,
              "description": "Technical blog covering AI-powered API test generation, eBPF-based testing, production behavior replay, dependency virtualization, infrastructure mocking, legacy application testing, migration regression testing, continuous validation, flaky test elimination, and developer productivity by Keploy.",
              "publisher": {
                "@type": "Organization",
                "name": ORG_NAME,
                "url": MAIN_SITE_URL,
                "logo": {
                  "@type": "ImageObject",
                  "url": `${MAIN_SITE_URL}/images/keploy-logo-full.svg`
                }
              }
            })
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
