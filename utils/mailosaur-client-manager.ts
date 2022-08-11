import { expect } from '@playwright/test'

const Mailosaur = require('mailosaur')
const apiKey = 'VeAbI3lehwlNHCvw'
const mailosaur = new Mailosaur(apiKey)
const serverId = 'kfbjvete'
const serverDomain = 'kfbjvete.mailosaur.net'

export class MailClient {
  async getEmailBySubject(sentTo: string, emailSubject: string) {
    const email = await mailosaur.messages.get(
      serverId,
      {
        sentTo: sentTo,
        subject: emailSubject,
      },
      {
        timeout: 100000,
      }
    )
    return email
  }

  getServerDomain() {
    return serverDomain
  }

  async getEmailByAddressFrom(sentTo: string, fromEmail: string) {
    const email = await mailosaur.messages.get(
      serverId,
      {
        sentTo: sentTo,
        sentFrom: fromEmail,
      },
      {
        timeout: 100000,
      }
    )
    return email
  }
  async assertPresenceInEmailBody(email, text) {
    await expect(email.text.body.includes(text)).toBeTruthy()
  }

  async getLink(email, linkNumber) {
    return email.html.links[linkNumber].href
  }

  async deleteEmail(emailID) {
    await mailosaur.messages.del(emailID)
  }

  async getCTLinkFromPlaceholderEmail(data) {
    const email = await this.getEmailBySubject(data.email, `ACTION NEEDED`)
    await this.deleteEmail(email.id)
    return this.getLink(email, 0)
  }
  async getBookingLinkFromRequestTimesEmail(data) {
    const email = await this.getEmailBySubject(
      data.email,
      `Consultation request`
    )
    // await this.deleteEmail(email.id)
    return this.getLink(email, 0)
  }

  async assertInvitationRecevied(data) {
    const email = await this.getEmailByAddressFrom(
      data.email,
      `booking@pSapient.onmicrosoft.com`
    )
    await this.assertPresenceInEmailBody(
      email,
      'Please open the link in one of the following browsers: Chrome, Firefox, Safari'
    )
    await this.assertPresenceInEmailBody(
      email,
      'Please ensure a fast & stable internet connection by closing unnecessary programs and windows'
    )
    await this.deleteEmail(email.id)
  }

  async assertPlaceholderRecevied(data) {
    const email = await this.getEmailBySubject(data.email, `ACTION NEEDED`)
    await this.assertPresenceInEmailBody(
      email,
      'When you complete the training, you will get a new invitation with the call dial-in details.'
    )
    await this.assertPresenceInEmailBody(
      email,
      'To complete the mandatory compliance training, please'
    )
    await this.deleteEmail(email.id)
  }

  async assertCanceletionInvitationRecevied(data) {
    const email = await this.getEmailBySubject(data.email, `Canceled:`)
    await this.deleteEmail(email.id)
  }
}
