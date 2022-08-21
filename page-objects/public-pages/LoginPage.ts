import { Page, Locator } from '@playwright/test'
import { BasePage } from '../BasePage'

export class LoginPage extends BasePage {
  readonly loginField: Locator
  readonly passwordField: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    super(page)
    this.loginField = page.locator('[name=login]')
    this.passwordField = page.locator('[name=password]')
    this.submitButton = page.locator('[type=submit]:has-text("Sign In")')
  }

  async loginWithEmail(ENV) {
    await this.loginField.type(ENV.email)
    await this.passwordField.type(ENV.password)
    await this.submitButton.click()
    await this.page.waitForURL(new RegExp(`^${ENV.URL}`))
    await this.page.waitForNavigation({ waitUntil: 'load' })
  }

  async loginWithIAM(ENV) {
    await this.loginField.type(ENV.email)
    await this.passwordField.type(ENV.password)
    await this.submitButton.click()
    await this.page.waitForURL(new RegExp(`^${ENV.URL}`))
  }

  async loginAsUser(URL: string, userID: string) {
    await this.page.goto(`${URL}/login_as?user_id=${userID}`, {
      waitUntil: 'domcontentloaded',
    })
  }
}
