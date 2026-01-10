import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    /* Maximum time one test can run for. */
    timeout: 30 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         */
        timeout: 5000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI if the API has rate limits (DummyJSON is lenient). */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [['html'], ['list', { printSteps: true }]],
    use: {
        /* Base URL to share across the framework */
        baseURL: 'https://dummyjson.com',
        /* Collect trace when retrying the failed test. */
        trace: 'on-first-retry',
        /* Add custom headers if needed */
        extraHTTPHeaders: {
            'Content-Type': 'application/json',
        },
    },
});