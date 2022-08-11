import { Page, Locator, expect } from '@playwright/test'
// import { getCurrentDay, getCurrentTimeFormated } from '../../utils/data-helpers'
import { BasePage } from '../BasePage'

export class ComplianceTrainingPage extends BasePage {
  readonly startButton: Locator

  constructor(page: Page) {
    super(page)
    this.startButton = page.locator(
      'button:has-text("Start compliance training")'
    )
  }

  async compelteCTFromPlaceholder(data) {
    const newPage = await this.page.context().newPage()
    await newPage.goto(
      await this.mailClient.getCTLinkFromPlaceholderEmail(data)
    )
    await expect(
      newPage.locator('button:has-text("Start compliance training")')
    ).toBeVisible()
    await newPage
      .locator('button:has-text("Start compliance training")')
      .click()
    for (let i = 0; i < 9; i++) {
      await newPage.locator(`button:has-text("Next")`).click() //this.clickButtonHasText('Next')
    }
    await newPage.locator(`button:has-text("Complete Training")`).click() //this.clickButtonHasText('Complete Training')
    await await expect(
      newPage.locator(`text=Compliance training was completed`)
    ).toBeVisible()
    await newPage.close()
  }

  // async completeCT() {
  //   await this.startButton.click()
  //   for (let i = 0; i < 9; i++) {
  //     await this.clickButtonHasText('Next')
  //   }
  //   await this.clickButtonHasText('Complete Training')
  //   await this.assertPresenceByText('Compliance training was completed')
  // }
}
