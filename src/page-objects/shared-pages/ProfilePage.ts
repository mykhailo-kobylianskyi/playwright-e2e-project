import { Page, Locator } from '@playwright/test'
import { BasePage } from '../BasePage'

export class ProfilePage extends BasePage {
  readonly editIcon: Locator
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly phoneInput: Locator
  readonly emailInput: Locator
  readonly timezoneInput: Locator

  constructor(page: Page) {
    super(page)
    this.editIcon = page.locator('[data-test-id="profile-data-edit-button"]')
    this.firstNameInput = page.locator('[data-test-id="profile-first-name"]')
    this.lastNameInput = page.locator('[data-test-id="profile-last-name"]')
    this.phoneInput = page.locator('[data-test-id="profile-phone"]')
    this.emailInput = page.locator('[data-test-id="profile-email"]')
    this.timezoneInput = page.locator('[data-test-id="profile-timezone"]')
  }

  async getUserDate(): Promise<Object> {
    //open edit panel
    this.editIcon.click()
    // create const and assign to them text from elements
    const firstName: string = await this.firstNameInput.inputValue()
    const lastname: string = await this.lastNameInput.inputValue()
    const phone: string = await this.phoneInput.inputValue()
    const email: string = await this.emailInput.inputValue()
    const timezone: string = await this.timezoneInput.textContent()
    return {
      name: `${firstName} ${lastname}`,
      phone,
      email,
      timezone,
    }
  }

  async navigateForAdmin() {
    await this.page.goto(`${this.baseURL}/profile`)
  }
  async navigateForClient() {
    await this.page.goto(`${this.baseURL}/client/profile`)
  }
}
