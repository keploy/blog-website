const apiUrl = process.env.WORDPRESS_API_URL || "https://wp.keploy.io/graphql";

try {
  new URL(apiUrl);
} catch (err) {
  throw new Error(`
    Please provide a valid WordPress instance URL.
    Add to your environment variables WORDPRESS_API_URL.
  `);
}

const { protocol, hostname, port, pathname } = apiUrl

/** @type {import('next').NextConfig} */
module.exports = {
  basePath: '/blog',
  assetPrefix: "/blog",
  images: {
    domains: ['secure.gravatar.com', 'wp.keploy.io' ,'keploy.io', 'pbs.twimg.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'keploy.io',
        port,
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wp.keploy.io',
        port,
        pathname: '/**',
      },  
    ],
  },
}
