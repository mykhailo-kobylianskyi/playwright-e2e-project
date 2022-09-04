import { expect } from '@playwright/test'
import { Mail } from './index'

export class MailLkClient extends Mail {
  async getCTLinkFromPlaceholderEmail(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `Pending compliance`,
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
  }

  async assertPlaceholderRecevied(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `PENDING COMPLIANCE`,
    })
  }

  async assertCanceletionInvitationRecevied(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `Canceled:`,
    })
  }

  async assertProjectInvitationRecevied(data) {
    const email = await this.getEmail({ sentTo: data.email })
    const subjectReg = new RegExp(`^.*Invitation to discuss.* Consulting$`)
    console.log(email.subject)
    console.log(email.sentFrom)
    await this.assertSubject(email, subjectReg)
  }
}
