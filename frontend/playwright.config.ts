import { defineConfig, devices } from '@playwright/test';

const SYSTEM_CHROMIUM_PATH = process.env.PLAYWRIGHT_CHROMIUM_PATH || '/usr/bin/chromium';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'DANGEROUSLY_DISABLE_HOST_CHECK=true BROWSER=none npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: SYSTEM_CHROMIUM_PATH,
        },
      },
    },
  ],
});
