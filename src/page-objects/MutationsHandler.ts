import { Page, chromium } from '@playwright/test'

export class Mutations {
  readonly page: Page
  readonly baseURL

  constructor(page: Page) {
    this.page = page
    this.baseURL = process.env.URL
  }

  async completeCall(callID, duration) {
    const admin_email = `${process.env.ADMIN_EMAIL}`
    const admin_password = `${process.env.ADMIN_PASSWORD}`
    const browser = await chromium.launch()
    const newContext = await browser.newContext({
      httpCredentials: {
        username: 'admin',
        password: 'admin',
      },
    })
    const newPage = await newContext.newPage()
    const adminPage = await newContext.newPage()
    await newPage.goto(`${this.baseURL}/dev/graphiql`)
    await adminPage.goto(this.baseURL, {
      waitUntil: 'domcontentloaded',
    })
    await adminPage.locator('[name=login]').type(admin_email)
    await adminPage.locator('[name=password]').type(admin_password)
    await adminPage.locator('[type=submit]:has-text("Sign In")').click()
    await adminPage.waitForURL(new RegExp(`^${this.baseURL}`))
    await newPage.bringToFront()
    await newPage.locator('textarea >>nth=0').fill(`mutation completeCall {
      completeCall(id: "${callID}", duration: ${duration}) {
        id
        status
      }
    }`)
    await newPage.waitForTimeout(2000)
    await newPage.keyboard.press('Control+Enter')
    await newPage.waitForTimeout(2000)
    browser.close()
  }
}
