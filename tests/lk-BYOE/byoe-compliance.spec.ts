import { test } from '@playwright/test'
import { ByoePage } from '../../page-objects/client-pages/project-pages/BYOePage'
import { LoginPage } from '../../page-objects/public-pages/LoginPage'
import { ExpertsPage } from '../../page-objects/client-pages/project-pages/ProjectExpertsPage'
import { generateRandomDataBYOE } from '../../utils/data-factory'
import { sendTestStatusAPI } from '../../utils/data-testrails'
import { ComplianceTrainingPage } from '../../page-objects/public-pages/ComplainceTraningPage'
import { CallPage } from '../../page-objects/client-pages/calls-pages/CallPage'

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

test.describe.parallel('BYOE: Compliance Training', () => {
  let byoeData: Input
  let byoePage: ByoePage
  let loginPage: LoginPage
  let callPage: CallPage
  let expertsPage: ExpertsPage
  let complianceTrainingPage: ComplianceTrainingPage
  const ENV = require('../../test-data/env-data.json')

  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    await page.goto(ENV.URL)
    loginPage = new LoginPage(page)
    byoePage = new ByoePage(page)
    callPage = new CallPage(page)
    expertsPage = new ExpertsPage(page)
    complianceTrainingPage = new ComplianceTrainingPage(page)
    await loginPage.loginWithIAM(ENV)
    await loginPage.loginAsUser(ENV.URL, ENV.clientFullMode.client_user_ID)
    await expertsPage.openExpertTab(ENV.URL, ENV.clientFullMode.project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
  })

  test.afterEach(async ({ page }, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that message Expert will be required to complete CT is shown for NOT compliant experts', async ({
    page,
  }, testInfo) => {
    //checking Complaince Warnign on the Expert card - Expert tab
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await byoePage.assertComplainceMessage()
    //checking Complaince Warnign on the Expert card - Call page
    await expertsPage.openExpertSchedulingPanel()
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.mailClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.openExpertsCallPage(byoeData)
    await callPage.assertExpertCardDetails(byoeData)
    await callPage.assertCallDetails(byoeData)
    await byoePage.assertComplainceMessage()
  })

  test('Check that BYOE gets invitation after compliting CT', async ({
    page,
  }, testInfo) => {
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.openExpertSchedulingPanel()
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await complianceTrainingPage.compelteCTFromPlaceholder(byoeData)
    await expertsPage.mailClient.assertInvitationRecevied(byoeData)
  })

  test('Check not compliant expert can complete compliance training after call is scheduled', async ({
    page,
  }, testInfo) => {
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.provideSchedulingDetails('45 minutes')
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    // await byoePage.assertSuccessAllert('Call was scheduled')
    await expertsPage.assertExpertStatus('Call scheduled', byoeData)
    await complianceTrainingPage.compelteCTFromPlaceholder(byoeData)
  })

  test('Check that client is able to see the date when compliance training was completed', async ({
    page,
  }, testInfo) => {
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.provideSchedulingDetails('45 minutes')
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    // await byoePage.assertSuccessAllert('Call was scheduled')
    await expertsPage.assertExpertStatus('Call scheduled', byoeData)
    await complianceTrainingPage.compelteCTFromPlaceholder(byoeData)
    await page.reload()
    await expertsPage.assertCTCompletedNote()
  })
})
