if (!URL.canParse(process.env.WORDPRESS_API_URL)) {
  throw new Error(`
    Please provide a valid WordPress instance URL.
    Add to your environment variables WORDPRESS_API_URL.
  `)
}

const { protocol, hostname, port, pathname } = new URL(
  process.env.WORDPRESS_API_URL
)

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
        hostname: 'secure.gravatar.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      },
    ],
  },
}