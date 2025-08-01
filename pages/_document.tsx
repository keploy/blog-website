import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/blog/manifest.json" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/blog/icons/web-app-manifest-192x192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="/blog/icons/web-app-manifest-512x512.png"
        />
        <meta name="theme-color" content="#fb923c" />
        
        {/* Google AdSense Script */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3485005084287002`}
          crossOrigin="anonymous"
          onError={(e) => {
            console.error("AdSense script failed to load", e);
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}