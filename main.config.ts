import { PlaywrightTestConfig } from '@playwright/test'
require('dotenv').config()

const config: PlaywrightTestConfig = {
  timeout: 1000 * 1000, //if remove, Playwrigh will  faild tests on 30 sec by defaul. It's a nlimit for test.
  retries: 0,
  reporter: 'html',
  repeatEach: 1,
  workers: 6,
  use: {
    trace: 'retain-on-failure',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 70 * 1000, // it's a limit for one action. Is a dafulat if not specified in options.
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
}

export default config
