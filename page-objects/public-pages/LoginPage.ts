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
  async navigate() {
    await this.page.goto(`${this.baseURL}/login`)
  }

  async loginWithEmail(email, password) {
    await this.loginField.type(email)
    await this.passwordField.type(password)
    await this.submitButton.click()
    await this.page.waitForURL(new RegExp(`^${this.baseURL}`))
    await this.page.waitForNavigation({ waitUntil: 'load' })
  }

  async loginWithIAM(email, password) {
    await this.loginField.type(email)
    await this.passwordField.type(password)
    await this.submitButton.click()
    await this.page.waitForURL(new RegExp(`^${this.baseURL}`))
  }

  async loginAsUser(URL: string, userID: string) {
    await this.page.goto(`${URL}/login_as?user_id=${userID}`, {
      waitUntil: 'domcontentloaded',
    })
  }
}
