import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from '../BasePage'

export class LoginPage extends BasePage {
  readonly loginField: Locator
  readonly passwordField: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    super(page)
    this.loginField = page.locator('[name=login]')
    this.passwordField = page.locator('[name=password]')
    this.submitButton = page.locator('[type=submit]')
  }

  async fillLoginForm(login: string, password: string) {
    await this.loginField.type(login)
    await this.passwordField.type(password)
  }
  async submitCredentials() {
    await this.submitButton.click()
    await this.page.waitForNavigation({ timeout: 20000 })
  }

  async loginAsUser(URL: string, id: string) {
    await this.page.goto(URL + '/login_as?user_id=' + id)
    // await this.page.waitForNavigation({ timeout: 20000 })
  }
}
