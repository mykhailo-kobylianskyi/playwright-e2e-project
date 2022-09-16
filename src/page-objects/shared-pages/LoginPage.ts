import { Page, Locator } from '@playwright/test'
import { getDateCurrent, setLocalStorage } from 'utils/data-helpers'
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
    await setLocalStorage(this.page)
  }

  async loginWithIAM(email, password) {
    await this.loginField.type(email)
    await this.passwordField.type(password)
    await this.submitButton.click()
    await this.page.waitForURL(new RegExp(`^${this.baseURL}`))
  }

  async impersonate(userEmail: string) {
    let iam: string = ''
    if (this.baseURL.includes('staging')) {
      iam = `staging`
    } else {
      iam = `test`
    }
    await this.page.goto(
      `https://iam.${iam}.platfrom.app/impersonate/${userEmail}`,
      {
        waitUntil: 'domcontentloaded',
      }
    )
  }
}
