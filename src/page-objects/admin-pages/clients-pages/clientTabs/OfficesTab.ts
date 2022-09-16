import { Page, Locator } from '@playwright/test'
import { BasePage } from '../../../BasePage'

const clientID = process.env.CLIENT_ID

export class OfficesTab extends BasePage {
  readonly x: Locator

  constructor(page: Page) {
    super(page)
  }

  async getOfficeCurrency(officeName: string): Promise<string> {
    const officeItem = this.page.locator(`tr:has-text('${officeName}')`)
    return officeItem.locator('td>>nth=3').textContent()
  }
  async getOfficeUnits(officeName: string): Promise<string> {
    const officeItem = this.page.locator(`tr:has-text('${officeName}')`)
    return officeItem.locator('td>>nth=4').textContent()
  }

  async navigate() {
    await this.page.goto(`${this.baseURL}/admin/clients/${clientID}/pricing`, {
      waitUntil: 'domcontentloaded',
    })
    await this.page.locator('text=edit>>nth=0').waitFor({ state: 'attached' })
  }
}
