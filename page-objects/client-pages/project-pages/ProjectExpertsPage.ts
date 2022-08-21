import { Page, Locator, expect } from '@playwright/test'
import { getCurrentDay } from '../../../utils/data-helpers'
import { BasePage } from '../../BasePage'

export class ExpertsPage extends BasePage {
  readonly addToShortlistButton: Locator
  readonly expertStatus: Locator
  readonly removeFromShortlistButton: Locator
  readonly rejectExpertButton: Locator
  readonly unrejectExpertButton: Locator
  readonly editExpertButton: Locator
  readonly scheduleCallButton: Locator
  readonly createCallButton: Locator
  readonly setTimeButton: Locator
  readonly provideAvailabilityButton: Locator
  readonly requestAvailabilityButton: Locator
  readonly callDateInput: Locator
  readonly rateInput: Locator
  readonly toolBarShowAs: Locator
  readonly toolBarSearch: Locator
  readonly exitRejectedFilterButton: Locator
  readonly callStatusButton: Locator
  readonly secondLineItem: Locator

  constructor(page: Page) {
    super(page)
    this.secondLineItem = page.locator('//tbody/tr >>nth=1')
    this.addToShortlistButton = page.locator(
      'button:has-text("Add to shortlist")'
    )
    this.callStatusButton = page.locator('button:has([data-icon="phone"])')
    this.removeFromShortlistButton = page.locator(
      'button:has-text("Remove from shortlist")'
    )
    this.rejectExpertButton = page.locator('button:has-text("Not interested")')
    this.unrejectExpertButton = page.locator(
      'button:has-text("Move back to list")'
    )
    this.exitRejectedFilterButton = page.locator(
      '#experts-filters div:has-text("Rejected experts") >> nth=1 >> div>> nth=0'
    )
    this.toolBarSearch = page.locator('#experts-top-toolbar>div>>nth=1>>input')
    this.toolBarShowAs = page.locator('#experts-top-toolbar>div>> nth=0')
    this.rateInput = page.locator('[placeholder="Rate"]')
    this.editExpertButton = page.locator('button:has-text("Edit profile")')
    this.scheduleCallButton = page.locator('button:has-text("Schedule a call")')
    this.createCallButton = page.locator('button:has-text("Create call")')
    this.setTimeButton = page.locator(
      'button:has-text("Set time for a call with your expert")'
    )
    this.provideAvailabilityButton = page.locator(
      'button:has-text("Provide availability")'
    )
    this.expertStatus = page.locator('//tbody/tr[1]/td[6]/div')
    this.requestAvailabilityButton = page.locator(
      'button:has-text("Request availability")'
    )
  }

  async addExpertNote(noteText) {
    await this.clickButtonHasText('Add a note')
    await this.noteInput.waitFor({ state: 'attached' })
    await this.noteInput.type(noteText)
    await this.clickButtonHasText('Post a note')
    await this.assertPresenceByText(noteText)
  }

  async assertTeaserWarningOnExpertCard() {
    await this.assertPresenceByText(
      'Not available for scheduling. You will be able to schedule your own experts when your organisation approves this feature.'
    )
  }

  async clearSearch() {
    await this.clearField(this.toolBarSearch)
  }

  async searchForExpert(data, expertCardState: 'detailed' | 'compact') {
    await this.clearSearch()
    await this.toolBarSearch.type(data.firstName + ' ' + data.lastName)
    await this.changeListView('compact')
    await this.secondLineItem.waitFor({ state: 'detached' })
    if (expertCardState == 'detailed') {
      await this.changeListView('detailed')
      const element = this.page.locator(
        `h3:has-text("${data.jobTitle} at ${data.companyName}")`
      )
      await expect(element).toBeVisible()
    }
  }

  async changeListView(viewOption: 'compact' | 'detailed') {
    await this.toolBarShowAs.click()
    await this.page.click(`[tabindex="-1"]:has-text("${viewOption} list")`)
  }

  async assertExpertLineitemStatus(data, status) {
    await this.searchForExpert(data, 'compact')
    const element = this.page.locator(
      `tbody[role="rowgroup"] >> text=${status}`
    )
    await expect(element).toBeVisible()
  }

  async assertExpertPresence(data, expectedPresence: boolean) {
    const element = this.page.locator(
      `text= • ${data.firstName} ${data.lastName}`
    )
    await this.changeListView('compact')
    if (expectedPresence) {
      await expect(element).toBeVisible()
    } else {
      await expect(element).not.toBeVisible()
    }
  }

  async asserExpertCardOpened(data) {
    await expect(
      this.page.locator(
        `h3:has-text("${data.jobTitle} at ${data.companyName}")`
      )
    ).toBeVisible()
  }

  async openExpertsCallPage(data) {
    await this.searchForExpert(data, 'detailed')
    await this.callStatusButton.click()
    await this.assertPrecenceOnPage('/client/calls/')
  }

  async asserExpertInProejct(data) {
    await this.searchForExpert(data, 'detailed')
    await this.asserExpertCardOpened(data)
  }

  async openExpertTab(url, projectId) {
    await this.page.goto(`${url}/client/projects/${projectId}/experts`, {
      waitUntil: 'domcontentloaded',
    })
  }

  async assertConflictCallWarning() {
    await this.assertPresenceByText(
      'Please note, you have another call at this timeslot'
    )
  }
  async assertSetTimeModal(data) {
    await this.assertInputValue(this.rateInput, data.rate)
    await this.assertPresenceByText('Call time (GMT+3)')
    await this.assertValueInSelector('Call duration', '1 hour')
    await this.assertValueInSelector('Currency', data.currency)
    await expect(this.createCallButton).toBeDisabled()
  }

  async bookCallOnSetTimeForm() {
    await expect(this.createCallButton).toBeEnabled()
    await this.createCallButton.click()
    await this.assertSuccessAllert('Call was scheduled')
  }

  async assertExpertStatus(title, data) {
    await this.searchForExpert(data, 'detailed')
    const element = this.page.locator(`button:has-text("${title}")`)
    await expect(element).toBeVisible()
  }

  async assertRateOnSetTimeForm(rate) {
    await expect(this.rateInput).toHaveValue(rate)
  }

  async filterExpertsBy(filterName) {
    await this.clickByText(filterName)
  }

  async assertCTCompletedNote() {
    await this.page.waitForSelector(
      'text=No bio available for the experts you or your team have added.'
    )
    this.assertPresenceByText(
      `Expert completed compliance training on ${getCurrentDay()}`
    )
  }

  async addToShortlist() {
    await this.addToShortlistButton.click()
    await this.assertSuccessAllert('Expert was added to shortlist.')
  }
  async rejectExpert() {
    await this.rejectExpertButton.click()
    await this.assertSuccessAllert('Expert was marked as not interested.')
  }
  async unrejectExpert() {
    await this.unrejectExpertButton.click()
    await this.assertSuccessAllert('Expert was moved back to qualified.')
  }

  async exitFromRejectedFilter() {
    await this.exitRejectedFilterButton.click()
  }

  async removeFromShortlist(data) {
    await this.searchForExpert(data, 'detailed')
    await expect(this.removeFromShortlistButton).toBeVisible()
    await this.removeFromShortlistButton.click()
    await this.assertSuccessAllert('Expert was removed from shortlist.')
  }

  async openExpertSchedulingPanel() {
    await this.scheduleCallButton.click()
    await expect(
      this.page.locator(
        'text=Selected. Please use the panel on the left to request an expert.'
      )
    ).toBeVisible()
  }

  async openEditExpertForm() {
    this.editExpertButton.click()
  }

  async openSetTimeModal() {
    await this.setTimeButton.click()
  }

  async openRequestAvalabilityModal() {
    await this.requestAvailabilityButton.click()
  }
  async requestAvailabilityOnModal() {
    await this.clickButtonHasText('Request Availability')
    await this.assertSuccessAllert('Request has been sent')
  }
}
