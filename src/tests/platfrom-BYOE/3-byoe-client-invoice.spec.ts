import { chromium, test } from '@playwright/test'
import { ByoePage } from '../../page-objects/client-pages/project-pages/BYOePage'
import { LoginPage } from '../../page-objects/shared-pages/LoginPage'
import { CallPage } from '../../page-objects/client-pages/calls-pages/CallPage'
import { ExpertsPage } from '../../page-objects/client-pages/project-pages/ProjectExpertsPage'
import { generateRandomDataBYOE } from '../../utils/data-factory'
import { sendTestStatusAPI } from '../../utils/data-testrails'
import { Mutations } from '../../page-objects/MutationsHandler'
import { InvoicingTab } from '../../page-objects/admin-pages/clients-pages/clientTabs/InvoicingTab'
import { OfficesTab } from '../../page-objects/admin-pages/clients-pages/clientTabs/OfficesTab'
import { ProfilePage } from '../../page-objects/shared-pages/ProfilePage'

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

test.describe('Client Invoice - one invoice for all tests', () => {
  let byoeData: Input
  let loginPage: LoginPage
  let invoicingTab: InvoicingTab
  let officesTab: OfficesTab
  let callDuration: number
  let clientUserData
  let officeName: string
  let officeCurrency: string

  test.beforeAll(async () => {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    const callPage = new CallPage(page)
    const byoePage = new ByoePage(page)
    const expertsPage = new ExpertsPage(page)
    const mutations = new Mutations(page)
    const profilePage = new ProfilePage(page)
    await loginPage.navigate()
    await loginPage.loginWithIAM(userEmail, userPassword)
    await expertsPage.openExpertTab(project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.openExpertSchedulingPanel()
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.openExpertsCallPage(byoeData)
    const callID = await callPage.getcallID()
    callDuration = 60
    await mutations.completeCall(callID, callDuration)
    await profilePage.navigateForClient()
    clientUserData = await profilePage.getUserDate()
    await page.close()
  })
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    invoicingTab = new InvoicingTab(page)
    officesTab = new OfficesTab(page)
    await loginPage.navigate()
    await loginPage.loginWithIAM(admin_email, admin_password)
    await invoicingTab.navigate()
  })

  test.afterEach(async ({}, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that after a BYOE call is completed, a client invoice line item is created', async ({
    page,
  }) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
  })

  test('Check that value on the invoice line item is correct (Expert Rate + Fee)', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    officeName = await invoicingTab.getOfficeFromInvoice(byoeData)
    await officesTab.navigate()
    officeCurrency = await officesTab.getOfficeCurrency(officeName)
    await invoicingTab.navigate()
    await invoicingTab.assertInvoiceCost(byoeData, callDuration, officeCurrency)
  })

  test('Check that FX in the client invoice is in the currency set in the project office', async () => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    officeName = await invoicingTab.getOfficeFromInvoice(byoeData)
    await officesTab.navigate()
    officeCurrency = await officesTab.getOfficeCurrency(officeName)
    await invoicingTab.navigate()
    await invoicingTab.assertInvoiceCurrency(byoeData, officeCurrency)
  })

  test('Check that admin cannot reach Expert or Call via invoice line item', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    await invoicingTab.assertInvoiceIsNotClickable(byoeData)
  })

  test('Check that a project name is clickable but if I click through to the project I cannot see the BYOE expert in there', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    await invoicingTab.assertProjectNameNotDisaplyExpert(byoeData)
  })

  test('Check that the User name is the user that added the expert via the BYOE feature', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    await invoicingTab.assertInvoiceUserName(byoeData, clientUserData.name)
  })

  test('Check that Units are calculated with the following formula = (expert cost + platfrom fee amount)/ (unit value of the project office)', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    officeName = await invoicingTab.getOfficeFromInvoice(byoeData)
    await officesTab.navigate()
    const unitPrice = await officesTab.getOfficeUnits(officeName)
    await invoicingTab.navigate()
    await invoicingTab.assertInvoiceUnits(byoeData, unitPrice)
  })

  test('Check that admin can Cancel invoice', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    await invoicingTab.createInvoice(byoeData)
    await invoicingTab.assertInvoicePresence(byoeData, 'absent')
    await invoicingTab.cancelInvoice()
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
  })

  /* Should be skipped until we would be able to get fixed date of the when call were scheduled */
  test.fixme('Check that Invoice Date is correct ', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    await invoicingTab.assertInvoiceDate(byoeData, 'date') // need to get  date where call was csheduled  for
  })
})

test.describe('Client Invoice - isolated tests with seperate invoices', () => {
  let byoeData: Input
  let loginPage: LoginPage
  let invoicingTab: InvoicingTab
  let officesTab: OfficesTab
  let completedCallDuration: number
  let officeName: string
  let officeCurrency: string

  test.beforeEach(async () => {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    const callPage = new CallPage(page)
    const byoePage = new ByoePage(page)
    const expertsPage = new ExpertsPage(page)
    const mutations = new Mutations(page)
    const profilePage = new ProfilePage(page)
    await loginPage.navigate()
    await loginPage.loginWithIAM(userEmail, userPassword)
    await expertsPage.openExpertTab(project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.openExpertSchedulingPanel()
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.openExpertsCallPage(byoeData)
    const callID = await callPage.getcallID()
    completedCallDuration = 25
    await mutations.completeCall(callID, completedCallDuration)
    await profilePage.navigateForClient()
    await page.close()
  })
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    invoicingTab = new InvoicingTab(page)
    officesTab = new OfficesTab(page)
    await loginPage.navigate()
    await loginPage.loginWithIAM(admin_email, admin_password)
    await invoicingTab.navigate()
  })

  test.afterEach(async ({}, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that expert fee is half of a fee when call less then 30 mins', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    officeName = await invoicingTab.getOfficeFromInvoice(byoeData)
    await officesTab.navigate()
    officeCurrency = await officesTab.getOfficeCurrency(officeName)
    await invoicingTab.navigate()
    await invoicingTab.assertInvoiceCost(
      byoeData,
      completedCallDuration,
      officeCurrency
    )
  })
  test('Check that admin can Download invoice as PDF', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    await invoicingTab.createInvoice(byoeData)
    await invoicingTab.downloadPDF()
  })
  test('Check that admin can Download invoice as CSV', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    await invoicingTab.createInvoice(byoeData)
    await invoicingTab.downloadCSV()
  })
  test('Check that admin can invoice items', async ({}) => {
    await invoicingTab.assertInvoicePresence(byoeData, 'present')
    await invoicingTab.createInvoice(byoeData)
    await invoicingTab.assertInvoicePresence(byoeData, 'absent')
  })
})
