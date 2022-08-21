import { Page, Locator } from '@playwright/test'
import { BasePage } from '../../BasePage'

export class InfoPage extends BasePage {
  readonly te1st: Locator

  constructor(page: Page) {
    super(page)
  }
  async openInfoTab(url, projectId) {
    await this.page.goto(`${url}/client/projects/${projectId}/info`, {
      waitUntil: 'domcontentloaded',
    })
  }
}
