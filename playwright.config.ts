// Smoke test for the template. CI builds the template, starts it on sample data and runs this;
// locally, `npm run test:smoke` against a dev server on 3030 (BASE_URL overrides).
import { defineConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3030';
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL, viewport: { width: 1280, height: 900 }, trace: 'retain-on-failure' },
  webServer: process.env.CI ? { command: 'cd templates/dashboard && npm start -- -p 3030', url: baseURL, reuseExistingServer: false, timeout: 120_000 } : undefined,
});
