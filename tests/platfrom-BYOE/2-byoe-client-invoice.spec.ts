import { test } from '@playwright/test'
import { ByoePage } from '../../page-objects/client-pages/project-pages/BYOePage'
import { CallsPage } from '../../page-objects/client-pages/project-pages/ProjectCallsPage'
import { LoginPage } from '../../page-objects/public-pages/LoginPage'
import { CallPage } from '../../page-objects/client-pages/calls-pages/CallPage'
import { ExpertsPage } from '../../page-objects/client-pages/project-pages/ProjectExpertsPage'
import { generateRandomDataBYOE } from '../../utils/data-factory'
import { sendTestStatusAPI } from '../../utils/data-testrails'
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
const userEmail = process.env.MASTER_EMAIL
const userPassword = process.env.MASTER_PASSWORD
const project1_ID = process.env.PROJECT_ID1
const admin_email = process.env.ADMIN_EMAIL
const admin_password = process.env.ADMIN_PASSWORD

test.describe.skip('Client Invoice', () => {
  let byoeData: Input
  let byoePage: ByoePage
  let callPage: CallPage
  let callsPage: CallsPage
  let loginPage: LoginPage
  let expertsPage: ExpertsPage
  let mutations: Mutations

  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    callsPage = new CallsPage(page)
    callPage = new CallPage(page)
    byoePage = new ByoePage(page)
    expertsPage = new ExpertsPage(page)
    mutations = new Mutations(page)
    await loginPage.navigate()
    await loginPage.loginWithEmail(userEmail, userPassword)
    await expertsPage.openExpertTab(project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.openExpertSchedulingPanel()
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.openExpertsCallPage(byoeData)
    const callID = await callPage.getcallID()
    await mutations.completeCall(callID, 77)
    await callPage.closeRateModal(4)
    await callPage.clientLogout()
    await loginPage.loginWithEmail(admin_email, admin_password)
  })

  test.afterEach(async ({}, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that after a BYOE call is completed, a client invoice line item is created', async ({
    page,
  }) => {})

  test.skip('Check that value on the invoice line item is correct (Expert Rate + Fee)', async ({
    page,
  }) => {})

  test.skip('Check that fee is correct in different currency (offices) (75 GBP, 90 EUR, 140 AUD, 95 CHF)', async ({
    page,
  }) => {})

  test.skip('Check that FX in the client invoice is in the currency set in the project office', async ({
    page,
  }) => {})

  test.skip('Check that BYOE invoice could be searched by (Project, Expert, A number of the invoice)', async ({
    page,
  }) => {})

  test.skip('Check that admin is able to filter invoices by status.', async ({
    page,
  }) => {})

  test.skip('Check that there is a (BYOE) next to the expert name', async ({
    page,
  }) => {})

  test.skip('Check that admin cannot reach Expert or Call via invoice line item', async ({
    page,
  }) => {})

  test.skip('Check that a project name is clickable but if I click through to the project I cannot see the BYOE expert in there', async ({
    page,
  }) => {})
})
