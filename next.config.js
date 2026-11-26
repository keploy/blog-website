if (!URL.canParse(process.env.WORDPRESS_API_URL)) {
  throw new Error(`
    Please provide a valid WordPress instance URL.
    Add to your environment variables WORDPRESS_API_URL.
  `)
}

const { blogRedirects } = require('./config/blog-redirects')

// Keploy UI capture posts to its ingest endpoint (components/KeployUICapture.tsx):
// production's api.keploy.io, or the endpoint this build was configured with.
const uiCaptureIngestEndpoint =
  process.env.NEXT_PUBLIC_KEPLOY_UI_CAPTURE_ENDPOINT || 'https://api.keploy.io/ui/v1/ingest'
if (!URL.canParse(uiCaptureIngestEndpoint) || !/^https?:$/.test(new URL(uiCaptureIngestEndpoint).protocol)) {
  throw new Error(
    `NEXT_PUBLIC_KEPLOY_UI_CAPTURE_ENDPOINT must be an absolute http(s) URL; got "${uiCaptureIngestEndpoint}".`
  )
}
const uiCaptureIngestOrigin = new URL(uiCaptureIngestEndpoint).origin

const contentSecurityPolicy = `
  connect-src 'self' ${uiCaptureIngestOrigin} https://telemetry.keploy.io https://www.google.com https://px.ads.linkedin.com https://px4.ads.linkedin.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://rp.liadm.com https://idx.liadm.com https://pagead2.googlesyndication.com https://*.clarity.ms https://news.google.com https://assets.apollo.io https://wp.keploy.io https://cdn.hashnode.com https://keploy-websites.vercel.app https://blog-website-phi-eight.vercel.app https://docbot.keploy.io https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://*.youtube.com https://*.googlevideo.com https://googleads.g.doubleclick.net https://marketplace.visualstudio.com https://api.github.com https://pro.ip-api.com https://api.vector.co https://aplo-evnt.com https://ep1.adtrafficquality.google https://ppptg.com;
  frame-src 'self' https://www.googletagmanager.com https://keploy-websites.vercel.app https://blog-website-phi-eight.vercel.app https://docbot.keploy.io https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://*.youtube.com https://news.google.com https://googleads.g.doubleclick.net https://*.google.com https://ppptg.com;
  img-src 'self' data: https://c.bing.com https://ppptg.com https://wp.keploy.io https://keploy.io https://secure.gravatar.com https://pbs.twimg.com https://*.wp.com https://*.wordpress.com *;
`
  .replace(/\s{2,}/g, ' ')
  .trim()

/** @type {import('next').NextConfig} */
module.exports = {
  basePath: '/blog',
  assetPrefix: "/blog",

  experimental: {
    // Inline critical CSS and defer the rest (via Critters) so the ~18 KiB
    // stylesheet — ~87% of which is unused above the fold — no longer
    // render-blocks first paint. EXPERIMENTAL: verify no FOUC before merge.
    optimizeCss: true,
  },

  // --- ADD THIS BLOCK ---
  // This exposes the server-side variable to the browser
  env: {
    NEXT_PUBLIC_WORDPRESS_API_URL: process.env.WORDPRESS_API_URL,
    // Lead capture (blog-mql): both values are public (the site key ships in
    // the JS bundle by design) and committed here as defaults so a clean
    // checkout can never silently build without them — a missing key sends
    // empty reCAPTCHA tokens and the telemetry server rejects every lead.
    NEXT_PUBLIC_TELEMETRY_URL:
      process.env.NEXT_PUBLIC_TELEMETRY_URL || 'https://telemetry.keploy.io',
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY:
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
      '6LcURVUtAAAAAL0lEReXR4kKj_SaLymm_0MQzJHB',
  },
  // ----------------------

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year — WP images rarely change at same URL
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['secure.gravatar.com', 'wp.keploy.io', 'keploy.io', 'pbs.twimg.com'],
    // First-party static assets now served from S3 (see S3_ASSET_BASE in
    // lib/constants). Some of them are SVGs (logo, nav icons) rendered through
    // next/image, so dangerouslyAllowSVG is required. Note the flag is global:
    // it also permits SVGs from every host above (wp.keploy.io WordPress
    // uploads, gravatar, twimg) and remotePatterns, not just our S3 bucket.
    // What keeps it safe regardless of source is the CSP + attachment
    // disposition below — SVGs are served with script-src 'none'; sandbox and
    // Content-Disposition: attachment, so they can't execute inline scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'keploy.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wp.keploy.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'keploy-devrel.s3.us-west-2.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
        ],
      },
    ]
  },
  async redirects() {
    return blogRedirects
  },
}
