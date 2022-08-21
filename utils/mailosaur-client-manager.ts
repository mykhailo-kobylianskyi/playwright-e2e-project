import { expect } from '@playwright/test'

const Mailosaur = require('mailosaur')
const apiKey = 'VeAbI3lehwlNHCvw'
const mailosaur = new Mailosaur(apiKey)
const serverId = 'kfbjvete'
const serverDomain = 'kfbjvete.mailosaur.net'

export class MailClient {
  getServerDomain() {
    return serverDomain
  }

  async getEmail(options?: {
    sentTo?: string
    sentFrom?: string
    subject?: string
  }) {
    if (options == undefined) {
      throw new Error('At least one option should be provided')
    } else {
      const email = await mailosaur.messages.get(
        serverId,
        {
          sentTo: options.sentTo,
          sentFrom: options.sentFrom,
          subject: options.subject,
        },
        {
          timeout: 100000,
        }
      )
      return email
    }
  }

  async assertPresenceInEmail(email, text) {
    await expect(email.text.body.includes(text)).toBeTruthy()
  }

  async getLink(email, linkNumber) {
    return email.html.links[linkNumber].href
  }

  async deleteEmail(emailID) {
    await mailosaur.messages.del(emailID)
  }

  async getCTLinkFromPlaceholderEmail(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `ACTION NEEDED`,
    })
    await this.deleteEmail(email.id)
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
    await this.assertPresenceInEmail(
      email,
      'Please open the link in one of the following browsers: Chrome, Firefox, Safari'
    )
    await this.assertPresenceInEmail(
      email,
      'Please ensure a fast & stable internet connection by closing unnecessary programs and windows'
    )
    await this.deleteEmail(email.id)
  }

  async assertPlaceholderRecevied(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `ACTION NEEDED`,
    })
    await this.assertPresenceInEmail(
      email,
      'When you complete the training, you will get a new invitation with the call dial-in details.'
    )
    await this.assertPresenceInEmail(
      email,
      'To complete the mandatory compliance training, please'
    )
    await this.deleteEmail(email.id)
  }

  async assertCanceletionInvitationRecevied(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `Canceled:`,
    })
    await this.deleteEmail(email.id)
  }

  async assertLEKProjectInvitationRecevied(data) {
    const email = await this.getEmail({ sentTo: data.email })
    await expect(email.subject).toMatch(
      new RegExp(`^.*Invitation to discuss.*with L\.E\.K\. Consulting$`)
    )
  }
}
