import { Page, Locator, expect } from '@playwright/test'
import { getCurrentDay, getCurrentTimeFormated } from '../../utils/data-helpers'
import { BasePage } from '../BasePage'

export class InfoPage extends BasePage {
  readonly te1st: Locator

  constructor(page: Page) {
    super(page)
  }
  async openInfoTab(url, projectId) {
    await this.page.goto(url + '/client/projects/' + projectId + '/experts')
  }
}
