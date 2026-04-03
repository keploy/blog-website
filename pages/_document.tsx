import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import { getOrganizationSchema } from '../lib/structured-data';

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

        {/* Blog Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": "Keploy Blog",
              "url": "https://keploy.io/blog",
              "description": "Technical blog covering AI-powered API test generation, eBPF-based testing, production behavior replay, dependency virtualization, infrastructure mocking, legacy application testing, migration regression testing, continuous validation, flaky test elimination, and developer productivity by Keploy.",
              "publisher": {
                "@type": "Organization",
                "name": "Keploy",
                "url": "https://keploy.io",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://keploy.io/images/keploy-logo-full.svg"
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
