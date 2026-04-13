import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
const envTestPath = path.resolve(__dirname, '.env.test');
if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
} else {
  console.warn(
    `No .env.test file found at "${envTestPath}". ` +
      'Playwright will use environment variables from the runner and built-in defaults.'
  );
}

function normalizeLocalhostUrl(value: string) {
  const url = new URL(value);
  // Playwright and Node may resolve "localhost" to IPv6 (::1) first.
  // Bind and request consistently over IPv4 so webServer readiness checks never flake.
  if (url.hostname === 'localhost') url.hostname = '127.0.0.1';
  return url;
}

const rawBaseUrl = process.env.BASE_URL || 'http://localhost:3000/blog';
const rawGraphqlUrl = process.env.PLAYWRIGHT_GRAPHQL_URL || 'http://localhost:4000/graphql';

const baseUrl = normalizeLocalhostUrl(rawBaseUrl);
const graphqlUrl = normalizeLocalhostUrl(rawGraphqlUrl);

// webServer spawns local processes, so we require an explicit port (or default one
// for local loopback) to avoid mismatches between the URL being tested and the
// port Next.js is started on.
if (!baseUrl.port) {
  if (baseUrl.hostname === '127.0.0.1') baseUrl.port = '3000';
  else {
    throw new Error(
      `BASE_URL must include an explicit port when running Playwright locally (got "${rawBaseUrl}"). ` +
        `Example: "http://127.0.0.1:3000/blog".`
    );
  }
}

if (!graphqlUrl.port) {
  if (graphqlUrl.hostname === '127.0.0.1') graphqlUrl.port = '4000';
  else {
    throw new Error(
      `PLAYWRIGHT_GRAPHQL_URL must include an explicit port when running Playwright locally (got "${rawGraphqlUrl}"). ` +
        `Example: "http://127.0.0.1:4000/graphql".`
    );
  }
}

const BASE_URL = baseUrl.toString();
const GRAPHQL_API_URL = graphqlUrl.toString();
const BASE_PORT = Number.parseInt(baseUrl.port, 10);
const BASE_HOST = baseUrl.hostname;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  /* Output directory for test artifacts */
  outputDir: 'test-results',

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 4,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list'], ['github']],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */



  /* Maximum time one test can run */
  timeout: process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT) : 60000,

  /* Expect timeout */
  expect: {
    timeout: process.env.TEST_EXPECT_TIMEOUT ? parseInt(process.env.TEST_EXPECT_TIMEOUT) : 10000,
  },

  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Capture screenshots and videos on failure */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Timeouts */
    actionTimeout: process.env.TEST_ACTION_TIMEOUT ? parseInt(process.env.TEST_ACTION_TIMEOUT) : 15000,
    navigationTimeout: process.env.TEST_NAVIGATION_TIMEOUT ? parseInt(process.env.TEST_NAVIGATION_TIMEOUT) : 60000,

    /* Network */
    offline: false,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */

    // Mobile responsive tests use explicit viewport overrides within
    // test.describe blocks (see tests/responsive/) instead of separate
    // browser projects — same rendering engine, just different viewport.
  ],

  /* Run mock GraphQL server + Next.js dev server before starting the tests */
  webServer: [
    {
      command: 'node tests/mock-server.js',
      url: 'http://localhost:4000/graphql',
      reuseExistingServer: !process.env.CI,
      timeout: 10000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // E2E runs against Next dev server so it can run in sandboxed environments
      // where `next start` may be blocked from binding to a port.
      command: `next dev -p ${BASE_PORT} -H ${BASE_HOST}`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: process.env.CI ? 180000 : 120000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        WORDPRESS_API_URL: GRAPHQL_API_URL,
        NEXT_PUBLIC_WORDPRESS_API_URL: GRAPHQL_API_URL,
        CRON_SECRET: 'test-secret',
        // Make the cron tests deterministic even if the runner machine has these set.
        GOOGLE_SERVICE_ACCOUNT_EMAIL: '',
        GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: '',
        GOOGLE_SEARCH_CONSOLE_SITE_URL: '',
        SITEMAP_PUBLIC_URL: '',
        // Playwright fixtures have fewer posts than production — lower the
        // assertFullSitemap threshold so the ISR route returns 200, not 503.
        SITEMAP_MIN_POSTS_PER_CATEGORY: '1',
      },
    },
  ],
});
