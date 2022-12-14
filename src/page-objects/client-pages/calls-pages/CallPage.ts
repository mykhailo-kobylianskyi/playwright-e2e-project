import { Page, Locator, expect } from '@playwright/test'
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

  async getcallID() {
    let url: string = await this.page.url()
    return url.replace(`${this.baseURL}/client/calls/`, '')
  }

  async assertExpertCardDetails(data) {
    await this.assertPresenceByText(
      `${data.firstName} ${data.lastName}`,
      'present'
    )
    await this.assertPresenceByText(
      `${data.jobTitle} at ${data.companyName}`,
      'present'
    )
    await this.assertPresenceByText(data.country, 'present')
  }

  async addCallNote(noteText) {
    await this.noteInput.waitFor({ state: 'attached' })
    await this.noteInput.type(noteText)
    await this.clickButtonHasText('Add note')
    await this.assertPresenceByText(noteText, 'present')
  }

  async assertCallDetails(data) {
    await this.assertPresenceByText('Call scheduled', 'present')
    //check date
    //check time
    // check duration
    // fix
  }

  async openRescheduleSetTimeModal() {
    await this.clickButtonHasText('Reschedule Call')
    await this.clickByText('Set new call time')
  }

  async bookCallOnRescheduleModal() {
    await expect(this.rescheduleButton).toBeEnabled()
    await this.rescheduleButton.click()
    await this.assertSuccessAllert('Call was scheduled')
    await this.assertPresenceByText('Call scheduled', 'present')
  }
  async addExpertNote(noteText) {
    await this.clickButtonHasText('Add a note')
    await this.noteInput.waitFor({ state: 'attached' })
    await this.noteInput.type(noteText)
    await this.clickButtonHasText('Post a note')
    await this.assertPresenceByText(noteText, 'present')
  }
  async cancelCall() {
    await this.clickButtonHasText('Cancel Call')
    await expect(this.modalWindow).toBeVisible()
    await this.assertPresenceByText(
      'You are trying to cancel a call.',
      'present'
    )
    await this.cancelCallButton.click()
    await this.assertPresenceByText('Canceled', 'present')
  }

  async assertConflictWarning() {
    await this.assertPresenceByText(
      'Please note, you have another call at this timeslot',
      'present'
    )
  }
}
