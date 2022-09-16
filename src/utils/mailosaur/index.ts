import { expect } from '@playwright/test'

export class Mail {
  readonly Mailosaur = require('mailosaur')
  readonly apiKey = 'VeAbI3lehwlNHCvw'
  readonly mailosaur = new this.Mailosaur(this.apiKey)
  readonly serverId = 'kfbjvete'
  readonly serverDomain = 'kfbjvete.mailosaur.net'

  getServerDomain() {
    return this.serverDomain
  }

  async getEmail(options?: {
    sentTo?: string
    sentFrom?: string
    subject?: string
  }) {
    if (options == undefined) {
      throw new Error('At least one option should be provided')
    } else {
      const email = await this.mailosaur.messages.get(
        this.serverId,
        {
          sentTo: options.sentTo,
          sentFrom: options.sentFrom,
          subject: options.subject,
        },
        {
          timeout: 200 * 1000,
        }
      )
      return email
    }
  }

  async deleteEmail(emailID) {
    await this.mailosaur.messages.del(emailID)
  }

  async assertPresenceInBody(email, text: string) {
    await expect(email.text.body.includes(text)).toBeTruthy()
  }

  async getLink(email, linkNumber) {
    return email.html.links[linkNumber].href
  }

  async assertSubject(email, subject: string | RegExp) {
    if (typeof subject === 'string') {
      await expect(email.subject.includes(subject)).toBeTruthy()
    } else {
      await expect(email.subject).toMatch(new RegExp(subject))
    }
  }
}
