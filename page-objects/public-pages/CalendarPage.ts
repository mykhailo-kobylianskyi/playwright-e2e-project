import { Page, Locator } from '@playwright/test'
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
    //fix after adjusting calendar
  }

  async openProvideTimesFromEmail(data) {
    const newPage = await this.page.context().newPage()
    await newPage.goto(
      await this.mailPtClient.getBookingLinkFromRequestTimesEmail(data)
    )
  }
}
