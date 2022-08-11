import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  timeout: 90000,
  retries: 0,
  testMatch: ['erase-testrun.spec.ts'],
  reporter: 'html',
  use: {
    headless: true,
    actionTimeout: 15000,
    ignoreHTTPSErrors: true,
  },
}

export default config
