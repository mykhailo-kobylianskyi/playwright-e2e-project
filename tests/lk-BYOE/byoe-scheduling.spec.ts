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
import { Mutations } from '../../page-objects/MutationsHandler'

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
let mutations: Mutations
const userEmail = process.env.MASTER_EMAIL
const userPassword = process.env.MASTER_PASSWORD
const project1_ID = process.env.PROJECT_ID1
const project2_ID = process.env.PROJECT_ID2

test.describe.parallel('Scheduling - Fields checking', () => {
  let byoeData: Input
  let byoePage: ByoePage
  let callPage: CallPage
  let callsPage: CallsPage
  let loginPage: LoginPage
  let expertsPage: ExpertsPage
  let complianceTrainingPage: ComplianceTrainingPage

  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    byoePage = new ByoePage(page)
    expertsPage = new ExpertsPage(page)
    mutations = new Mutations(page)
    await loginPage.navigate()
    await loginPage.loginWithIAM(userEmail, userPassword)
    await expertsPage.openExpertTab(project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
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
    await byoePage.agreeOnAgreement(byoeData)
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

  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    callsPage = new CallsPage(page)
    callPage = new CallPage(page)
    byoePage = new ByoePage(page)
    expertsPage = new ExpertsPage(page)
    complianceTrainingPage = new ComplianceTrainingPage(page)
    await loginPage.navigate()
    await loginPage.loginWithIAM(userEmail, userPassword)
    await expertsPage.openExpertTab(project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
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
    await expertsPage.mailLkClient.assertPlaceholderRecevied(byoeData)
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
    await expertsPage.clearSearch()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.openExpertSchedulingPanel()
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.assertConflictCallWarning()
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailLkClient.assertPlaceholderRecevied(byoeData)
  })

  test('Check Create a call with expert form', async ({ page }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.assertSetTimeModal(byoeData)
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailLkClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.assertExpertStatus('Call scheduled', byoeData)
  })

  test('Check call on expert card after scheduling (‘Call sheduled: Month, date. time’)', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailLkClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.assertExpertStatus('Call scheduled', byoeData)
  })

  test('Check expert status after scheduling (Scheduled)', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailLkClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.searchForExpert(byoeData, 'compact')
    await expertsPage.assertPresenceByText('Call scheduled')
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
    await expertsPage.mailLkClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.openExpertTab(project2_ID)
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
    await expertsPage.mailLkClient.assertPlaceholderRecevied(byoeData)
    await callsPage.openCallsTab1(project1_ID)
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
    await expertsPage.mailLkClient.assertPlaceholderRecevied(byoeData)
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
    await callPage.mailLkClient.assertPlaceholderRecevied(byoeData)
    await callPage.cancelCall()
    await callPage.mailLkClient.assertCanceletionInvitationRecevied(byoeData)
    await callPage.openRescheduleSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await callPage.bookCallOnRescheduleModal()
    await complianceTrainingPage.compelteCTFromPlaceholder(byoeData)
    await callPage.mailLkClient.assertInvitationRecevied(byoeData)
  })

  test('Check rescheduling upon scheduled call - Set new call time (Check email for expert and client)', async ({
    page,
  }, testInfo) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.openExpertsCallPage(byoeData)
    await callPage.mailLkClient.assertPlaceholderRecevied(byoeData)
    await callPage.openRescheduleSetTimeModal()
    await callPage.provideSetTimeSchedulingDetails('30 minutes')
    await callPage.bookCallOnRescheduleModal()
    await callPage.mailLkClient.assertCanceletionInvitationRecevied(byoeData)
    await complianceTrainingPage.compelteCTFromPlaceholder(byoeData)
    await callPage.mailLkClient.assertInvitationRecevied(byoeData)
  })

  test('Check that a client is able to reschedule a call if he selects a time slot that is already chosen for another call', async ({
    request,
    page,
  }) => {
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.openExpertsCallPage(byoeData)
    await callPage.openRescheduleSetTimeModal()
    const callID = await callPage.getcallID()
    await mutations.completeCall(callID, 60)
    await callPage.closeRateModal(4)
    await callPage.provideSetTimeSchedulingDetails('30 minutes')
    await callPage.assertConflictWarning()
    await callPage.bookCallOnRescheduleModal()
    await callPage.mailLkClient.assertCanceletionInvitationRecevied(byoeData)
    await complianceTrainingPage.compelteCTFromPlaceholder(byoeData)
    await callPage.mailLkClient.assertInvitationRecevied(byoeData)
  })
})
