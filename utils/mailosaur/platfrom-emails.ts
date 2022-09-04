import { expect } from '@playwright/test'
import { Mail } from './index'

export class MailPtClient extends Mail {
  async getCTLinkFromPlaceholderEmail(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `Consulting Call`,
    })
    return this.getLink(email, 0)
  }

  async getBookingLinkFromRequestTimesEmail(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `Consultation request`,
    })
    return this.getLink(email, 0)
  }

  async assertInvitationRecevied(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      sentFrom: `booking@pSapient.onmicrosoft.com`,
    })
    await this.assertPresenceInBody(
      email,
      'Please open the link in one of the following browsers: Chrome, Firefox, Safari'
    )
    await this.assertPresenceInBody(
      email,
      'Please ensure a fast & stable internet connection by closing unnecessary programs and windows'
    )
  }

  async assertPlaceholderRecevied(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `ACTION NEEDED`,
    })
    await this.assertPresenceInBody(
      email,
      'When you complete the training, you will get a new invitation with the call dial-in details.'
    )
    await this.assertPresenceInBody(
      email,
      'To complete the mandatory compliance training, please'
    )
  }

  async assertCanceletionInvitationRecevied(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `Canceled:`,
    })
    // fix  - add checks for canceletion
  }
}
