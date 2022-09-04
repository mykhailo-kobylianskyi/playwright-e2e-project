import { chromium, test } from '@playwright/test'
import { ByoePage } from '../../page-objects/client-pages/project-pages/BYOePage'
import { Invoices } from '../../page-objects/admin-pages/InvoicesPage'
import { Mutations } from '../../page-objects/MutationsHandler'
import { LoginPage } from '../../page-objects/public-pages/LoginPage'
import { CallPage } from '../../page-objects/client-pages/calls-pages/CallPage'
import { ExpertsPage } from '../../page-objects/client-pages/project-pages/ProjectExpertsPage'
import { generateRandomDataBYOE } from '../../utils/data-factory'
import { sendTestStatusAPI } from '../../utils/data-testrails'

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
const user_email = process.env.MASTER_EMAIL
const user_password = process.env.MASTER_PASSWORD
const project1_ID = process.env.PROJECT_ID1
const admin_finance_email = process.env.ADMIN_FINANCE_EMAIL
const admin_finance_password = process.env.ADMIN_FINANCE_PASSWORD
const admin_email = process.env.ADMIN_EMAIL
const admin_password = process.env.ADMIN_PASSWORD

test.describe('Experts Invoice testing', () => {
  let byoeData: Input
  let byoePage: ByoePage
  let callPage: CallPage
  let loginPage: LoginPage
  let expertsPage: ExpertsPage
  let mutations: Mutations
  let invoicesPage: Invoices

  test.beforeAll(async () => {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    callPage = new CallPage(page)
    byoePage = new ByoePage(page)
    expertsPage = new ExpertsPage(page)
    mutations = new Mutations(page)
    invoicesPage = new Invoices(page)
    await loginPage.navigate()
    await loginPage.loginWithEmail(user_email, user_password)
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
    await mutations.completeCall(callID, 60)
    await callPage.closeRateModal(4)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    invoicesPage = new Invoices(page)
    await loginPage.navigate()
    await loginPage.loginWithEmail(admin_finance_email, admin_finance_password)
    await invoicesPage.navigate()
  })

  test.afterEach(async ({}, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that ONLY Finance ADMINs sees invoice of BYOE', async ({
    page,
  }) => {
    await invoicesPage.findExpertInvoice(user_email, byoeData)
    await invoicesPage.adminLogout()
    await loginPage.loginWithEmail(admin_email, admin_password)
    await invoicesPage.navigate()
    await invoicesPage.assertInvoiceAbsence(byoeData)
  })

  test('Check that Invoice created when the call was completed with correct all required info', async ({}) => {
    await invoicesPage.findExpertInvoice(user_email, byoeData)
    await invoicesPage.assertInvoiceDate()
    await invoicesPage.assertInvoiceCost(byoeData)
    await invoicesPage.assertInvoiceStatus('Not paid')
  })

  test('Check that engagement detail is not clickable', async ({ page }) => {
    await invoicesPage.findExpertInvoice(user_email, byoeData)
    await invoicesPage.assertInvoiceIsNotClicable()
  })
})

test.describe('Experts Invoice status testing', () => {
  let byoeData: Input
  let byoePage: ByoePage
  let callPage: CallPage
  let loginPage: LoginPage
  let expertsPage: ExpertsPage
  let mutations: Mutations
  let invoicesPage: Invoices

  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    callPage = new CallPage(page)
    byoePage = new ByoePage(page)
    expertsPage = new ExpertsPage(page)
    mutations = new Mutations(page)
    invoicesPage = new Invoices(page)
    await loginPage.navigate()
    await loginPage.loginWithEmail(user_email, user_password)
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
    await mutations.completeCall(callID, 60)
    await callPage.closeRateModal(2)
    await loginPage.navigate()
    await loginPage.loginWithEmail(admin_finance_email, admin_finance_password)
    await invoicesPage.navigate()
  })

  test.afterEach(async ({}, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that admin is able to change status to Paid.', async ({
    page,
  }) => {
    await invoicesPage.findExpertInvoice(user_email, byoeData)
    await invoicesPage.assertInvoiceStatus('Not paid')
    await invoicesPage.changeInvoiceStatus('Paid')
    await invoicesPage.assertInvoiceStatus('Paid')
  })

  test('Check that admin is able to filter invoices by status.', async ({
    page,
  }) => {
    await invoicesPage.findExpertInvoice(user_email, byoeData)
    await invoicesPage.assertInvoiceStatus('Not paid')
    await invoicesPage.fileterInvoicesByStatus('Not paid')
    await invoicesPage.assertInvoicePresence(user_email, byoeData)
    await invoicesPage.changeInvoiceStatus('Paid')
    await invoicesPage.assertInvoiceStatus('Paid')
    await invoicesPage.fileterInvoicesByStatus('Paid')
    await invoicesPage.assertInvoicePresence(user_email, byoeData)
  })
})
