import { test } from '@playwright/test'
import { ByoePage } from '../../page-objects/client-pages/project-pages/BYOePage'
import { LoginPage } from '../../page-objects/public-pages/LoginPage'
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
const userEmail = process.env.MASTER_EMAIL_TEASER_MODE
const userPassword = process.env.MASTER_PASSWORD_TEASER_MODE
const project1_ID = process.env.PROJECT_ID_TEASER_MODE

test.describe.parallel('BYOE modes', () => {
  let byoeData: Input
  let byoePage: ByoePage
  let loginPage: LoginPage
  let expertsPage: ExpertsPage

  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    byoePage = new ByoePage(page)
    expertsPage = new ExpertsPage(page)
    await loginPage.navigate()
    await loginPage.loginWithEmail(userEmail, userPassword)
    await expertsPage.openExpertTab(project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
  })

  test.afterEach(async ({}, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that user is not able to schedule a call in BYOE Teaser mode', async () => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.asserScheduleFieldsDisabled()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await expertsPage.asserExpertCardOpened(byoeData)
    await expertsPage.assertTeaserWarningOnExpertCard()
  })

  test('Check that Expert can only be created and updated in BYOE Teaser mode', async () => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await expertsPage.asserExpertCardOpened(byoeData)
    await expertsPage.searchForExpert(byoeData, 'detailed')
    await expertsPage.openEditExpertForm()
    await byoePage.assertFormValues(byoeData)
    await byoePage.assertBYOEFormAvailable()
    await byoePage.clearForm()
    byoeData = generateRandomDataBYOE()
    await byoePage.fillForm(byoeData)
    await byoePage.submitFormWithSaveButton()
    await expertsPage.asserExpertCardOpened(byoeData)
  })

  test('Check that user can Request feature in BYOE Teaser mode', async () => {
    await byoePage.assertTeaserBeforeRequest()
    await byoePage.assertTeaserAfterRequest()
  })
})
