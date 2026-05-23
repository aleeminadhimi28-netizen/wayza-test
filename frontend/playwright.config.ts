import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 120 * 1000,
  expect: {
    timeout: 35 * 1000,
  },
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // ── Desktop (runs all test suites) ──────────────────────────────────
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /(?<!mobile)\.spec\.ts$/,
    },

    // ── Mobile devices (runs only mobile.spec.ts) ────────────────────────
    {
      name: 'iPhone 13',
      use: { ...devices['iPhone 13'] },
      testMatch: /mobile\.spec\.ts$/,
    },
    {
      name: 'Samsung Galaxy S9+',
      use: { ...devices['Galaxy S9+'] },
      testMatch: /mobile\.spec\.ts$/,
    },
    {
      name: 'iPad',
      use: { ...devices['iPad (gen 7)'] },
      testMatch: /mobile\.spec\.ts$/,
    },
  ],
});
