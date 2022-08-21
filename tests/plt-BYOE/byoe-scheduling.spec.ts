import { test } from '@playwright/test'
import { ByoePage } from '../../page-objects/client-pages/project-pages/BYOePage'
import { CallsPage } from '../../page-objects/client-pages/project-pages/ProjectCallsPage'
import { LoginPage } from '../../page-objects/public-pages/LoginPage'
import { CallPage } from '../../page-objects/client-pages/calls-pages/CallPage'
import { ComplianceTrainingPage } from '../../page-objects/public-pages/ComplainceTraningPage'
import { CalendarPage } from '../../page-objects/public-pages/CalendarPage'
import { ExpertsPage } from '../../page-objects/client-pages/project-pages/ProjectExpertsPage'
import { generateRandomDataBYOE } from '../../utils/data-factory'
import { sendTestStatusAPI } from '../../utils/data-testrails'
import { faker } from '@faker-js/faker'

type Input = {
  uniqueId: string
  firstName: string
  lastName: string
  jobTitle: string
  companyName: string
  phoneNumber: string
  rate: string
  tags: string[]
  country: string
  timeZone: string
  email: string
  sourceOption: string
  currency: string
  angleOptionIndex: number
  linkedinURl: string
}

test.describe.parallel('Scheduling - Fields checking', () => {
  let byoeData: Input
  let byoePage: ByoePage
  let callPage: CallPage
  let callsPage: CallsPage
  let loginPage: LoginPage
  let expertsPage: ExpertsPage
  let complianceTrainingPage: ComplianceTrainingPage
  const ENV = require('../../test-data/env-data.json')

  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    await page.goto(ENV.URL)
    loginPage = new LoginPage(page)
    byoePage = new ByoePage(page)
    callsPage = new CallsPage(page)
    callPage = new CallPage(page)
    complianceTrainingPage = new ComplianceTrainingPage(page)
    expertsPage = new ExpertsPage(page)
    await loginPage.loginWithEmail(ENV)

    await loginPage.loginAsUser(ENV.URL, ENV.clientFullMode.client_user_ID)
    await expertsPage.openExpertTab(ENV.URL, ENV.clientFullMode.project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
  })

  test.afterEach(async ({ page }, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check call duration options on add BYOE modal', async ({
    page,
  }, testInfo) => {
    await byoePage.enableCallScheduleFields()
    await byoePage.assertCallDurrationOptions()
  })

  test('Check duration options on Set Call modal for BYOE', async ({
    page,
  }, testInfo) => {
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.openExpertSchedulingPanel()
    await expertsPage.openSetTimeModal()
    await byoePage.assertCallDurrationOptions()
  })
})

test.describe.parallel('Scheduling', () => {
  let byoeData: Input
  let byoePage: ByoePage
  let callPage: CallPage
  let callsPage: CallsPage
  let loginPage: LoginPage
  let expertsPage: ExpertsPage
  let calendarPage: CalendarPage
  let complianceTrainingPage: ComplianceTrainingPage
  const ENV = require('../../test-data/env-data.json')

  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    await page.goto(ENV.URL)
    loginPage = new LoginPage(page)
    byoePage = new ByoePage(page)
    callsPage = new CallsPage(page)
    calendarPage = new CalendarPage(page)
    callPage = new CallPage(page)
    complianceTrainingPage = new ComplianceTrainingPage(page)
    expertsPage = new ExpertsPage(page)
    await loginPage.loginWithEmail(ENV)

    await loginPage.loginAsUser(ENV.URL, ENV.clientFullMode.client_user_ID)
    await expertsPage.openExpertTab(ENV.URL, ENV.clientFullMode.project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.openExpertSchedulingPanel()
  })

  test.afterEach(async ({ page }, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that client is able to schedule a call with BYOE via Set time', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailClient.assertPlaceholderRecevied(byoeData)
  })

  test('Check expert status after scheduling (Call Scheduled)', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.assertExpertStatus('Call scheduled', byoeData)
  })

  test('Check that message about conflict call present during Set Time scheduling', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.assertExpertStatus('Call scheduled', byoeData)
    byoeData = generateRandomDataBYOE()
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.openExpertSchedulingPanel()
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.assertConflictCallWarning()
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailClient.assertPlaceholderRecevied(byoeData)
  })

  test('Check Create a call with expert form', async ({ page }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.assertSetTimeModal(byoeData)
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.assertExpertStatus('Call scheduled', byoeData)
  })

  test('Check call on expert card after scheduling (‘Call sheduled: Month, date. time’)', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.assertExpertStatus('Call scheduled', byoeData)
  })

  test('Check expert status after scheduling (Scheduled)', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.assertExpertLineitemStatus(byoeData, 'Call scheduled')
  })

  test('Check that  Rate and Currency is updated for the expert profile on the project level if change it on Set Time modal', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    byoeData.rate = faker.finance.amount(0, 1000, 0)
    await expertsPage.fillInputByPlaceholder('Rate', byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.assertExpertLineitemStatus(byoeData, 'Call scheduled')
    await expertsPage.openExpertTab(ENV.URL, ENV.clientFullMode.project2_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.assertEmailAddressWarning()
    await byoePage.assertAutocompleteFormValues(byoeData)
  })

  test('Check scheduled call on the call tab', async ({ page }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailClient.assertPlaceholderRecevied(byoeData)
    await callsPage.openCallsTab(ENV.URL, ENV.clientFullMode.project1_ID)
    await callsPage.searchExpertCall(byoeData)
    await callsPage.assertCallPresence(byoeData)
  })

  test('Check that call Data (time, duration, expert details) correct on the Call page', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.openExpertsCallPage(byoeData)
    await callPage.assertExpertCardDetails(byoeData)
    await callPage.assertCallDetails(byoeData)
  })

  test('Check that invite (placeholder) is received by expert after scheduling', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await complianceTrainingPage.compelteCTFromPlaceholder(byoeData)
  })

  test('Check that client is able to cancel BYOE call', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.openExpertsCallPage(byoeData)
    await callPage.cancelCall()
  })
  test('Check rescheduling after cancelation call - Set time for new call (Check email for expert)', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.openExpertsCallPage(byoeData)
    await callPage.mailClient.assertPlaceholderRecevied(byoeData)
    await callPage.cancelCall()
    await callPage.mailClient.assertCanceletionInvitationRecevied(byoeData)
    await callPage.openRescheduleSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await callPage.bookCallOnRescheduleModal()
    await complianceTrainingPage.compelteCTFromPlaceholder(byoeData)
    await callPage.mailClient.assertInvitationRecevied(byoeData)
  })

  test('Check rescheduling upon scheduled call - Set new call time (Check email for expert and client)', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.openExpertsCallPage(byoeData)
    await callPage.mailClient.assertPlaceholderRecevied(byoeData)
    await callPage.openRescheduleSetTimeModal()
    await callPage.provideSetTimeSchedulingDetails('30 minutes')
    await callPage.bookCallOnRescheduleModal()
    await callPage.mailClient.assertCanceletionInvitationRecevied(byoeData)
    await complianceTrainingPage.compelteCTFromPlaceholder(byoeData)
    await callPage.mailClient.assertInvitationRecevied(byoeData)
  })

  test('Check that a client is able to reschedule a call if he selects a time slot that is already chosen for another call', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.openExpertsCallPage(byoeData)
    await callPage.mailClient.assertPlaceholderRecevied(byoeData)
    await callPage.openRescheduleSetTimeModal()
    await callPage.provideSetTimeSchedulingDetails('30 minutes')
    await callPage.assertConflictWarning()
    await callPage.bookCallOnRescheduleModal()
    await callPage.mailClient.assertCanceletionInvitationRecevied(byoeData)
    await complianceTrainingPage.compelteCTFromPlaceholder(byoeData)
    await callPage.mailClient.assertInvitationRecevied(byoeData)
  })

  test.skip('Check that client is able to schedule a call with BYOE via Request availability', async ({
    page,
  }, testInfo) => {
    await expertsPage.openRequestAvalabilityModal()
    await expertsPage.requestAvailabilityOnModal()
    await expertsPage.openExpertsCallPage(byoeData)
    await calendarPage.openProvideTimesFromEmail(byoeData)
    await calendarPage.selectAvailableSlot(0)
    // Submit timslots
    //select timeslot
    // make sure call booked
    // await callPage.mailClient.assertPlaceholderRecevied(byoeData)
  })
})
