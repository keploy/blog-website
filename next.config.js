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
  images: {
    domains: ['secure.gravatar.com', 'keploy.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'keploy.io',
        port,
        pathname: '/**',
      },  
    ],
  },
}
