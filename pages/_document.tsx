import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google AdSense Script */}
        {/* <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3485005084287002`}
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('AdSense script failed to load', e);
          }}
        /> */}

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Keploy",
              "url": "https://keploy.io",
              "logo": "https://keploy.io/images/keploy-logo-full.svg",
              "description": "Keploy builds open-source AI-powered testing tools for automatic API test generation, dependency virtualization, production-like sandboxes, and continuous validation using eBPF kernel technology. Keploy keeps testing aligned with AI-driven code velocity.",
              "sameAs": [
                "https://twitter.com/Keployio",
                "https://www.linkedin.com/company/keploy",
                "https://github.com/keploy",
                "https://www.youtube.com/@keploy"
              ]
            })
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