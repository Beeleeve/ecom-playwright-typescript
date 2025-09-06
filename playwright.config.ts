import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from config folder
dotenv.config({
  path: path.join('config', `.env.${process.env.ENV || 'test'}`),
});

// Where to store logged-in storage state
export const STORAGE_STATE: string = path.join(
  __dirname,
  process.env.STORAGE_STATE || '.auth/storageState.json'
);

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],

  // reporter: 'allure-playwright',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Setup project (runs first, generates storageState)
    {
      name: 'setup',
      testMatch: 'hooks/global.setup.ts', // updated to .ts for TypeScript
    },

    // Logged-in user tests (depend on setup)
    {
      name: 'e2e tests logged in user',
      testMatch: '**/*.spec.ts', // updated to .ts for TypeScript
      testIgnore: ['login/valid.login.spec.ts'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
    },
    {
      name: 'e2e tests guest user',
      testIgnore: ['hooks/*.setup.ts'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    // Extra project for Chrome (optional)
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});