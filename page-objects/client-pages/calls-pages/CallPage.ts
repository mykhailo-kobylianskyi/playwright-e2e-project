import { Page, Locator, expect } from '@playwright/test'
import {
  getCurrentDayForDatepicker,
  getCurrentTimeFormated,
} from '../../../utils/data-helpers'
import { BasePage } from '../../BasePage'

export class CallPage extends BasePage {
  readonly rescheduleButton: Locator
  readonly cancelCallButton: Locator

  constructor(page: Page) {
    super(page)
    this.cancelCallButton = page.locator(
      'div[role="dialog"] button:has-text("Cancel Call")'
    )
    this.rescheduleButton = page.locator(
      'div[role="dialog"] button:has-text("Reschedule")'
    )
  }
  async assertExpertCardDetails(data) {
    await this.assertPresenceByText(`${data.firstName} ${data.lastName}`)
    await this.assertPresenceByText(`${data.jobTitle} at ${data.companyName}`)
    await this.assertPresenceByText(data.country)
  }

  async addCallNote(noteText) {
    await this.noteInput.waitFor({ state: 'attached' })
    await this.noteInput.type(noteText)
    await this.clickButtonHasText('Add note')
    await this.assertPresenceByText(noteText)
  }

  async assertCallDetails(data) {
    await this.assertPresenceByText('Call scheduled')
    //check date
    //check time
    // check duration
  }

  async openRescheduleSetTimeModal() {
    await this.clickButtonHasText('Reschedule Call')
    await this.clickByText('Set new call time')
  }

  async bookCallOnRescheduleModal() {
    await expect(this.rescheduleButton).toBeEnabled({ timeout: 5000 })
    await this.rescheduleButton.click()
    await this.assertSuccessAllert('Call was scheduled')
    await this.assertPresenceByText('Call scheduled')
  }
  async addExpertNote(noteText) {
    await this.clickButtonHasText('Add a note')
    await this.noteInput.waitFor({ state: 'attached' })
    await this.noteInput.type(noteText)
    await this.clickButtonHasText('Post a note')
    await this.assertPresenceByText(noteText)
  }
  async cancelCall() {
    await this.clickButtonHasText('Cancel Call')
    await expect(this.modalWindow).toBeVisible()
    await this.assertPresenceByText('You are trying to cancel a call.')
    await this.cancelCallButton.click()
    await this.assertPresenceByText('Canceled')
  }

  async assertConflictWarning() {
    await this.assertPresenceByText(
      'Please note, you have another call at this timeslot'
    )
  }
}
