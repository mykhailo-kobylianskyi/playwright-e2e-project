import { expect } from '@playwright/test'
import { Mail } from './index'

export class MaillkClient extends Mail {
  async getCTLinkFromPlaceholderEmail(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `Pending compliance`,
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
    await this.deleteEmail(email.id)
  }

  async assertPlaceholderRecevied(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `PENDING COMPLIANCE L.E.K. Consulting Call`,
    })
    await this.deleteEmail(email.id)
  }

  async assertCanceletionInvitationRecevied(data) {
    const email = await this.getEmail({
      sentTo: data.email,
      subject: `Canceled:`,
    })
    await this.deleteEmail(email.id)
  }

  async assertProjectInvitationRecevied(data) {
    const email = await this.getEmail({ sentTo: data.email })
    const subjectReg = new RegExp(
      `^.*Invitation to discuss.*with L\.E\.K\. Consulting$`
    )
    await this.assertSubject(email, subjectReg)
  }
}
