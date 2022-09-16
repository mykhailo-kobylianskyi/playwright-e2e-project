import { test } from '@playwright/test'
import { ByoePage } from '../../page-objects/client-pages/project-pages/BYOePage'
import { LoginPage } from '../../page-objects/shared-pages/LoginPage'
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

const userEmail = process.env.MASTER_EMAIL
const userPassword = process.env.MASTER_PASSWORD
const project1_ID = process.env.PROJECT_ID1

test.describe.parallel('Managment', () => {
  let byoeData: Input
  let byoePage: ByoePage
  let callPage: CallPage

  let loginPage: LoginPage
  let expertsPage: ExpertsPage

  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    byoePage = new ByoePage(page)
    expertsPage = new ExpertsPage(page)
    callPage = new CallPage(page)
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
    await byoePage.assertAggrementClosed(byoeData)
  })

  test.afterEach(async ({ page }, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that client can add selected expert to the short list', async ({
    page,
  }, testInfo) => {
    await expertsPage.addToShortlist()
    await expertsPage.filterExpertsBy('Shortlisted')
    await expertsPage.assertExpertPresence(byoeData, true)
  })

  test('Check that client can remove selected expert from the short list', async ({
    page,
  }, testInfo) => {
    await expertsPage.addToShortlist()
    await expertsPage.filterExpertsBy('Shortlisted')
    await expertsPage.assertExpertPresence(byoeData, true)
    await expertsPage.removeFromShortlist(byoeData)
    await expertsPage.filterExpertsBy('Shortlisted')
    await expertsPage.changeListView('compact')
    await expertsPage.filterExpertsBy('Shortlisted')
    await expertsPage.assertExpertPresence(byoeData, false)
  })

  test('Check that client can move BYOE to the Not Interested', async ({
    page,
  }, testInfo) => {
    await expertsPage.searchForExpert(byoeData, 'detailed')
    await expertsPage.rejectExpert()
    await expertsPage.filterExpertsBy('Show rejected experts')
    await expertsPage.changeListView('compact')
    await expertsPage.assertExpertPresence(byoeData, true)
  })

  test('Check that client can remove BYOE to the Not Interested', async ({
    page,
  }, testInfo) => {
    await expertsPage.searchForExpert(byoeData, 'detailed')
    await expertsPage.rejectExpert()
    byoeData = generateRandomDataBYOE()
    await expertsPage.clearSearch()
    await expertsPage.changeListView('compact')
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await expertsPage.searchForExpert(byoeData, 'detailed')
    await expertsPage.rejectExpert()
    await expertsPage.filterExpertsBy('Show rejected experts')
    await expertsPage.changeListView('compact')
    await expertsPage.assertExpertPresence(byoeData, true)
    await expertsPage.changeListView('detailed')
    await expertsPage.unrejectExpert()
    await expertsPage.exitFromRejectedFilter()
    await expertsPage.searchForExpert(byoeData, 'compact')
    await expertsPage.assertExpertPresence(byoeData, true)
  })

  test('Check that client is able to add a note for the BYOE after adding', async ({
    page,
  }, testInfo) => {
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.addExpertNote(
      `${byoeData.lastName} works in the ${byoeData.companyName}`
    )
  })

  test('Check that user is able to left notes on the Call page', async ({
    page,
  }, testInfo) => {
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.openExpertSchedulingPanel()
    await expertsPage.openSetTimeModal()
    await expertsPage.provideSetTimeSchedulingDetails('30 minutes')
    await expertsPage.assertRateOnSetTimeForm(byoeData.rate)
    await expertsPage.bookCallOnSetTimeForm()
    await expertsPage.maillkClient.assertPlaceholderRecevied(byoeData)
    await expertsPage.openExpertsCallPage(byoeData)
    await callPage.assertCallDetails(byoeData)
    await callPage.addCallNote(
      `${byoeData.lastName} from ${byoeData.companyName} should be in this call`
    )
  })
})
