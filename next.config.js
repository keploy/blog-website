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
  connect-src 'self' https://px.ads.linkedin.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://rp.liadm.com https://idx.liadm.com https://pagead2.googlesyndication.com https://*.clarity.ms https://news.google.com https://assets.apollo.io https://wp.keploy.io https://cdn.hashnode.com https://keploy-websites.vercel.app https://blog-website-phi-eight.vercel.app https://docbot.keploy.io https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://*.youtube.com https://*.googlevideo.com https://googleads.g.doubleclick.net https://marketplace.visualstudio.com https://api.github.com https://pro.ip-api.com https://api.vector.co https://aplo-evnt.com https://ep1.adtrafficquality.google https://ppptg.com https://telemetry.keploy.io;
  frame-src 'self' https://www.googletagmanager.com https://keploy-websites.vercel.app https://blog-website-phi-eight.vercel.app https://docbot.keploy.io https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://*.youtube.com https://news.google.com https://googleads.g.doubleclick.net https://*.google.com https://ppptg.com;
  img-src 'self' data: https://c.bing.com https://ppptg.com https://wp.keploy.io https://keploy.io https://secure.gravatar.com https://pbs.twimg.com https://*.wp.com https://*.wordpress.com *;
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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year — WP images rarely change at same URL
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['secure.gravatar.com', 'wp.keploy.io', 'keploy.io', 'pbs.twimg.com'],
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
  async redirects() {
    return [
      // ──────────────────────────────────────────────────────────
      // /community/:slug → /technology/:slug
      // These posts belong to "technology" in WordPress but had
      // stale /community/ URLs indexed or linked externally.
      // ──────────────────────────────────────────────────────────
      {
        source: '/community/bitbucket-self-hosting-running-ebpfprivileged-programs',
        destination: '/technology/bitbucket-self-hosting-running-ebpfprivileged-programs',
        permanent: true,
      },
      {
        source: '/community/building-a-cli-tool-in-go-with-cobra-and-viper',
        destination: '/technology/building-a-cli-tool-in-go-with-cobra-and-viper',
        permanent: true,
      },
      {
        source: '/community/create-stunning-parallax-animations-on-your-website',
        destination: '/technology/create-stunning-parallax-animations-on-your-website',
        permanent: true,
      },
      {
        source: '/community/gemini-pro-vs-openai-benchmark-ai-for-software-testing',
        destination: '/technology/gemini-pro-vs-openai-benchmark-ai-for-software-testing',
        permanent: true,
      },
      {
        source: '/community/how-to-use-covdata-for-better-code-coverage-in-go',
        destination: '/technology/how-to-use-covdata-for-better-code-coverage-in-go',
        permanent: true,
      },
      {
        source: '/community/integration-of-e2e-testing-in-a-cicd-pipeline',
        destination: '/technology/integration-of-e2e-testing-in-a-cicd-pipeline',
        permanent: true,
      },
      {
        source: '/community/mastering-nyc-enhance-javascript-typescript-test-coverage',
        destination: '/technology/mastering-nyc-enhance-javascript-typescript-test-coverage',
        permanent: true,
      },
      {
        source: '/community/migration-guide-from-restassured-to-keploy',
        destination: '/technology/migration-guide-from-restassured-to-keploy',
        permanent: true,
      },
      {
        source: '/community/protocol-parsing-guide',
        destination: '/technology/protocol-parsing-guide',
        permanent: true,
      },
      {
        source: '/community/revolutionising-unit-test-generation-with-llms',
        destination: '/technology/revolutionising-unit-test-generation-with-llms',
        permanent: true,
      },
      {
        source: '/community/scram-authentication-overcoming-mock-testing-challenges',
        destination: '/technology/scram-authentication-overcoming-mock-testing-challenges',
        permanent: true,
      },
      {
        source: '/community/secure-your-database-communications-with-ssl-in-docker-containers-learn-to-set-up-ssl-for-mongodb-and-postgresql-efficiently',
        destination: '/technology/secure-your-database-communications-with-ssl-in-docker-containers-learn-to-set-up-ssl-for-mongodb-and-postgresql-efficiently',
        permanent: true,
      },
      {
        source: '/community/using-tc-bpf-program-to-redirect-dns-traffic-in-docker-containers',
        destination: '/technology/using-tc-bpf-program-to-redirect-dns-traffic-in-docker-containers',
        permanent: true,
      },

      // ──────────────────────────────────────────────────────────
      // /technology/:slug → /community/:slug
      // These posts belong to "community" in WordPress but had
      // stale /technology/ URLs indexed or linked externally.
      // ──────────────────────────────────────────────────────────
      {
        source: '/technology/canary-testing-a-comprehensive-guide-for-developers',
        destination: '/community/canary-testing-a-comprehensive-guide-for-developers',
        permanent: true,
      },
      {
        source: '/technology/codium-vs-copilot-which-ai-coding-assistant-is-best-for-you',
        destination: '/community/codium-vs-copilot-which-ai-coding-assistant-is-best-for-you',
        permanent: true,
      },
      {
        source: '/technology/decoding-brd-a-devs-guide-to-functional-and-non-functional-requirements-in-testing',
        destination: '/community/decoding-brd-a-devs-guide-to-functional-and-non-functional-requirements-in-testing',
        permanent: true,
      },
      {
        source: '/technology/decoding-http2-traffic-is-hard-but-ebpf-can-help',
        destination: '/community/decoding-http2-traffic-is-hard-but-ebpf-can-help',
        permanent: true,
      },
      {
        source: '/technology/how-to-generate-test-cases-with-automation-tools',
        destination: '/community/how-to-generate-test-cases-with-automation-tools',
        permanent: true,
      },
      {
        source: '/technology/mock-vs-stub-vs-fake-understand-the-difference',
        destination: '/community/mock-vs-stub-vs-fake-understand-the-difference',
        permanent: true,
      },
      {
        source: '/technology/performance-testing-guide-to-ensure-your-software-performs-at-its-best',
        destination: '/community/performance-testing-guide-to-ensure-your-software-performs-at-its-best',
        permanent: true,
      },
      {
        source: '/technology/python-get-current-directory',
        destination: '/community/python-get-current-directory',
        permanent: true,
      },
      {
        source: '/technology/top-5-cypress-alternatives-for-web-testing-and-automation',
        destination: '/community/top-5-cypress-alternatives-for-web-testing-and-automation',
        permanent: true,
      },
      {
        source: '/technology/understanding-branch-coverage-in-software-testing',
        destination: '/community/understanding-branch-coverage-in-software-testing',
        permanent: true,
      },
      {
        source: '/technology/understanding-statement-coverage-in-software-testing',
        destination: '/community/understanding-statement-coverage-in-software-testing',
        permanent: true,
      },
      {
        source: '/technology/what-is-postgres-wire-protocol',
        destination: '/community/what-is-postgres-wire-protocol',
        permanent: true,
      },
      {
        source: '/technology/writing-test-cases-for-cron-jobs-testing',
        destination: '/community/writing-test-cases-for-cron-jobs-testing',
        permanent: true,
      },

      // ──────────────────────────────────────────────────────────
      // Broken backlink redirects
      // ──────────────────────────────────────────────────────────
      {
        source: '/community/end-to-end-testing-and-why-do-you-need-it',
        destination: '/community/end-to-end-testing-guide',
        permanent: true,
      },
      {
        source: '/community/rest-api-testing-guide',
        destination: '/community/api-testing-strategies',
        permanent: true,
      },
      {
        source: '/community/https-keploy-io-blog-community-cursor-vs-github-copilot',
        destination: '/community/codium-vs-copilot-which-ai-coding-assistant-is-best-for-you',
        permanent: true,
      },
      {
        source: '/unit-test-generat',
        destination: '/community/revolutionising-unit-test-generation-with-llms',
        permanent: true,
      },
      {
        source: '/test-case-generation',
        destination: '/community/how-to-generate-test-cases-with-automation-tools',
        permanent: true,
      },
    ]
  },
}
