import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
const envTestPath = path.resolve(__dirname, '.env.test');
const dotenvResult = dotenv.config({ path: envTestPath });

if (dotenvResult.error) {
  if (process.env.CI) {
    throw new Error(
      `Failed to load environment variables from .env.test at "${envTestPath}". ` +
        'In CI, .env.test must be present or all required environment variables must be provided by the CI environment.'
    );
  } else {
    // Continue with defaults, but make it clear how to fix the configuration.
    console.error(
      `Failed to load environment variables from .env.test at "${envTestPath}". ` +
        'Tests will fall back to default configuration values. To fix this, create a .env.test file at the given path ' +
        'or ensure the necessary environment variables are set in your local environment.'
    );
  }
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/blog';
const GRAPHQL_API_URL = process.env.PLAYWRIGHT_GRAPHQL_URL || 'http://localhost:4000/graphql';

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
      command: 'npm run build && npm start',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: process.env.CI ? 180000 : 120000,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        WORDPRESS_API_URL: GRAPHQL_API_URL,
        NEXT_PUBLIC_WORDPRESS_API_URL: GRAPHQL_API_URL,
      },
    },
  ],
});
