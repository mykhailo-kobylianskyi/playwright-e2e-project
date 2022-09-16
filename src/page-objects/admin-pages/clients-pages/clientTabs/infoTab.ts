import { Page } from '@playwright/test'
import { BasePage } from '../../../BasePage'

const clientID = process.env.CLIENT_ID

export class InfoTab extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async navigate() {
    await this.page.goto(`${this.baseURL}/admin/clients/${clientID}/info`, {
      waitUntil: 'domcontentloaded',
    })
  }
}
