// Permanent redirects for the blog, relative to basePath (/blog).
// Shared by next.config.js and the post-body link normalizer so in-content
// links can point straight at the final URL instead of hopping through these.
const blogRedirects = [
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
    source: '/community/software-development-tools-in-2025',
    destination: '/community/software-development-tools',
    permanent: true,
  },
  {
    source: '/community/guide-to-automated-testing-tools-in-2025',
    destination: '/community/automated-software-testing-tools',
    permanent: true,
  },
  {
    source: '/community/top-7-test-automation-tools-boost-your-software-testing-efficiency',
    destination: '/community/test-automation-tools',
    permanent: true,
  },
  {
    source: '/community/exploring-the-effectiveness-of-e2e-testing-in-comparison-with-integration-testing',
    destination: '/technology/integration-vs-e2e-testing-what-worked-for-me-as-a-charm',
    permanent: true,
  },
  {
    source: '/community/functional-testing-unveiling-types-and-real-world-applications',
    destination: '/community/functional-testing-an-in-depth-overview',
    permanent: true,
  },
]

module.exports = { blogRedirects }
