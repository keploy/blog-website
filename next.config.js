if (!URL.canParse(process.env.WORDPRESS_API_URL)) {
  throw new Error(`
    Please provide a valid WordPress instance URL.
    Add to your environment variables WORDPRESS_API_URL.
  `)
}

const { protocol, hostname, port, pathname } = new URL(
  process.env.WORDPRESS_API_URL
)

const contentSecurityPolicy = `
  connect-src 'self' https://px.ads.linkedin.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://rp.liadm.com https://idx.liadm.com https://pagead2.googlesyndication.com https://*.clarity.ms https://news.google.com https://assets.apollo.io https://wp.keploy.io https://cdn.hashnode.com https://keploy-websites.vercel.app https://blog-website-phi-eight.vercel.app https://docbot.keploy.io https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://*.youtube.com https://*.googlevideo.com https://googleads.g.doubleclick.net https://marketplace.visualstudio.com https://api.github.com https://pro.ip-api.com https://api.vector.co https://aplo-evnt.com https://ep1.adtrafficquality.google https://ppptg.com;
  frame-src 'self' https://www.googletagmanager.com https://keploy-websites.vercel.app https://blog-website-phi-eight.vercel.app https://docbot.keploy.io https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://*.youtube.com https://news.google.com https://googleads.g.doubleclick.net https://*.google.com https://ppptg.com;
  img-src 'self' https://c.bing.com https://ppptg.com;
`
  .replace(/\s{2,}/g, ' ')
  .trim()

/** @type {import('next').NextConfig} */
module.exports = {
  basePath: '/blog',
  assetPrefix: "/blog",
  
  // --- ADD THIS BLOCK ---
  // This exposes the server-side variable to the browser
  env: {
    NEXT_PUBLIC_WORDPRESS_API_URL: process.env.WORDPRESS_API_URL,
  },
  // ----------------------

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wp.keploy.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'keploy.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
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
}
