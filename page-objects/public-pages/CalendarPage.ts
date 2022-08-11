import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from '../BasePage'

export class CalendarPage extends BasePage {
  readonly startButton: Locator

  constructor(page: Page) {
    super(page)
    this.startButton = page.locator(
      'button:has-text("Start compliance training")'
    )
  }

  async selectAvailableSlot(number) {
    await this.page.pause()
    await this.page.locator('div>[cursor="pointer"]>>nth=1').hover()
    await this.page.pause()
    await this.page.locator('div>[cursor="pointer"]>>nth=1').click()
    await this.page
      .locator('div>[cursor="pointer"]>>nth=1')
      .click({ delay: 100 })
  }

  async openProvideTimesFromEmail(data) {
    const newPage = await this.page.context().newPage()
    await newPage.goto(
      await this.mailClient.getBookingLinkFromRequestTimesEmail(data)
    )
  }
}
