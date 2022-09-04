import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from '../../BasePage'

export class CallsPage extends BasePage {
  readonly searchInput: Locator
  readonly secondLineItem: Locator

  constructor(page: Page) {
    super(page)
    this.searchInput = page.locator(
      '[placeholder="Filter by expert name (min 3 characters)"]'
    )
    this.secondLineItem = page.locator('//tbody/tr >>nth=1')
  }

  async openCallsTab1(projectId) {
    await this.page.goto(`${this.baseURL}/client/projects/${projectId}/calls`, {
      waitUntil: 'domcontentloaded',
    })
  }
  async searchExpertCall(data) {
    await this.clearField(this.searchInput)
    await this.searchInput.type(data.firstName + ' ' + data.lastName, {
      delay: 10,
    })
    await this.secondLineItem.waitFor({ state: 'detached' })
  }

  async assertCallPresence(data) {
    await this.assertPresenceByText(`${data.firstName} ${data.lastName}`)
    await this.assertPresenceByText(`${data.jobTitle} at ${data.companyName}`)
    await this.assertPresenceByText(data.country)
    //add checking call date
    //add checking call duration
  }
}
