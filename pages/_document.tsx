import { Html, Head, Main, NextScript } from 'next/document';
import { getOrganizationSchema, getBlogSchema } from '../lib/structured-data';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Baloo 2 — non-render-blocking font load (replaces @import in index.css) */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&display=swap"
          rel="stylesheet"
          media="print"
          // @ts-ignore — onLoad switches media to "all" after non-blocking download
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&display=swap"
            rel="stylesheet"
          />
        </noscript>

        {/* DM Sans — preloaded globally so individual pages don't re-request */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap"
          rel="stylesheet"
          media="print"
          // @ts-ignore — onLoad switches media to "all" after non-blocking download
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap"
            rel="stylesheet"
          />
        </noscript>

        {/* Organization Schema — single source from lib/structured-data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
        {/* Blog Schema — single source from lib/structured-data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getBlogSchema()),
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
