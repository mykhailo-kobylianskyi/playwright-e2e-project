import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from '../../BasePage'

export class TranscriptsPage extends BasePage {
  readonly te1st: Locator

  constructor(page: Page) {
    super(page)
  }
  async openTranscriptsTab(url, projectId) {
    await this.page.goto(`${url}/client/projects/${projectId}/transcripts`, {
      waitUntil: 'domcontentloaded',
    })
  }
}
