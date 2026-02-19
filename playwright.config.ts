import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Output directory for test artifacts */
  outputDir: 'test-results/e2e',

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

  testMatch: '**/*.spec.ts',
  testIgnore: [
    '**/node_modules/**',
    '**/fixtures/**',         
    '**/utils/**',
    '**/*.draft.spec.ts',
  ],

  /* Maximum time one test can run */
  timeout: process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT) : 30000,

  /* Expect timeout */
  expect: {
    timeout: process.env.TEST_EXPECT_TIMEOUT ? parseInt(process.env.TEST_EXPECT_TIMEOUT) : 10000,
  },

  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000/blog',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Capture screenshots and videos on failure */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Timeouts */
    actionTimeout: process.env.TEST_ACTION_TIMEOUT ? parseInt(process.env.TEST_ACTION_TIMEOUT) : 15000,
    navigationTimeout: process.env.TEST_NAVIGATION_TIMEOUT ? parseInt(process.env.TEST_NAVIGATION_TIMEOUT) : 30000,

    /* Network */
    offline: false,
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: process.env.BASE_URL || 'http://localhost:3000/blog',
    reuseExistingServer: !process.env.CI,
    timeout: process.env.WEB_SERVER_TIMEOUT ? parseInt(process.env.WEB_SERVER_TIMEOUT) : 120000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
