import { test } from '@playwright/test'
import { ByoePage } from '../../page-objects/client-pages/project-pages/BYOePage'
import { LoginPage } from '../../page-objects/shared-pages/LoginPage'
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
const project2_ID = process.env.PROJECT_ID2

let byoeData: Input
let byoePage: ByoePage
let loginPage: LoginPage
let expertsPage: ExpertsPage

test.describe.parallel('Create and update BYOE W/O sending Invitation', () => {
  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    byoePage = new ByoePage(page)
    expertsPage = new ExpertsPage(page)
    await loginPage.navigate()
    await loginPage.loginWithIAM(userEmail, userPassword)
    await expertsPage.openExpertTab(project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
  })

  test.afterEach(async ({ page }, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that user is able to add BYOE w/o sending invitation', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await expertsPage.asserExpertInProejct(byoeData)
  })

  test('Check that T&Cs modal is opened after a user click on the Continue button', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.assertSubmitAgreementButtonEnebled(false)
    await byoePage.checkAggrementCheckbox()
    await byoePage.assertSubmitAgreementButtonEnebled(true)
  })

  test('Check system behaviour when user adds BYOE expert that is already added to another client project', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await expertsPage.asserExpertInProejct(byoeData)
    await expertsPage.openExpertTab(project2_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.assertEmailAddressWarning()
    await byoePage.assertAutocompleteFormValues(byoeData)
  })

  test('Check that client can remove the email address with the X icon on the BYOE add form', async ({
    page,
  }, testInfo) => {
    await byoePage.assertAddingFormUnavailable()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.assertBYOEFormAvailable()
    await byoePage.submitFormWithContinueButton()
    await byoePage.submitFormWithContinueButton()
    await byoePage.assertMandatoryFieldsOnBYOEForm()
    await byoePage.clearBYOEEmailField()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await expertsPage.asserExpertInProejct(byoeData)
  })

  test('Check that call details field are mandatory', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.enableCallScheduleFields()
    await byoePage.submitFormWithContinueButton()
    await byoePage.assertMandatoryFieldsOnScheduleCallForm()
  })

  test('Check that client is able to schedule a call during adding BYOE', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.provideSchedulingDetails('30 minutes')
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertSuccessAllert('Call was scheduled')
    await byoePage.assertAggrementClosed(byoeData)
    await expertsPage.assertExpertStatus('Call scheduled', byoeData)
    await expertsPage.maillkClient.assertPlaceholderRecevied(byoeData)
  })

  test('Check that client is not prevent to schedule a conflicting call with internal expert during adding expert', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.provideSchedulingDetails('30 minutes')
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertSuccessAllert('Call was scheduled')
    await byoePage.assertAggrementClosed(byoeData)
    byoeData = generateRandomDataBYOE()
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.provideSchedulingDetails('30 minutes')
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertSuccessAllert('Call was scheduled')
    await byoePage.assertAggrementClosed(byoeData)
    await byoePage.maillkClient.assertPlaceholderRecevied(byoeData)
  })

  test('Check that message ‘Please note, you have another call at this timeslot’ is shown on the  form if client has a conflicting call during adding', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.provideSchedulingDetails('30 minutes')
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertSuccessAllert('Call was scheduled')
    await byoePage.assertAggrementClosed(byoeData)
    byoeData = generateRandomDataBYOE()
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.provideSchedulingDetails('30 minutes')
    await byoePage.assertConflictCallWarning()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertSuccessAllert('Call was scheduled')
    await byoePage.assertAggrementClosed(byoeData)
    await byoePage.maillkClient.assertPlaceholderRecevied(byoeData)
  })

  test('Check that user is able to edit the expert profile after clicking on the Edit profile icon', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
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

  test('Check mandatory fields for the BYOE form', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkNoInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await expertsPage.searchForExpert(byoeData, 'detailed')
    await expertsPage.openEditExpertForm()
    await byoePage.assertFormValues(byoeData)
    await byoePage.assertBYOEFormAvailable()
    await byoePage.clearForm()
    await byoePage.submitFormWithSaveButton()
    await byoePage.submitFormWithSaveButton()
    await byoePage.assertErrorMessageForFields(
      [
        'First name',
        'Last name',
        'Relevant position',
        'Company relevant to project',
        'Project Hourly Rate',
      ],
      `can't be blank`
    )
  })
})

test.describe.parallel('Create and update BYOE with sending Invitation', () => {
  test.beforeEach(async ({ page }) => {
    byoeData = generateRandomDataBYOE()
    loginPage = new LoginPage(page)
    byoePage = new ByoePage(page)
    expertsPage = new ExpertsPage(page)
    await loginPage.navigate()
    await loginPage.loginWithIAM(userEmail, userPassword)
    await expertsPage.openExpertTab(project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
  })

  test.afterEach(async ({ page }, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that user is able to add BYOE with invitation to project', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkYesInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.assertPresenceByText(
      'Customize outreach invitation',
      'present'
    )
    await byoePage.fillInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await expertsPage.asserExpertInProejct(byoeData)
  })

  test('Check that after adding expert receive invitation', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkYesInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.assertPresenceByText(
      'Customize outreach invitation',
      'present'
    )
    await byoePage.fillInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await byoePage.maillkClient.assertProjectInvitationRecevied(byoeData)
    await expertsPage.asserExpertInProejct(byoeData)
  })

  test('Check that after user has been invited to the porject, he has status invited', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkYesInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.assertPresenceByText(
      'Customize outreach invitation',
      'present'
    )
    await byoePage.fillInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await byoePage.maillkClient.assertProjectInvitationRecevied(byoeData)
    await expertsPage.assertPresenceByText(
      'Expert invitation is pending',
      'present'
    )
    await expertsPage.assertExpertLineitemStatus(byoeData, 'Invited')
  })

  test('Check that after user has been invited to the porject, he displeyed in Invited filter', async ({
    page,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoeData)
    await byoePage.fillForm(byoeData)
    await byoePage.checkYesInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.assertPresenceByText(
      'Customize outreach invitation',
      'present'
    )
    await byoePage.fillInvitation()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement(byoeData)
    await byoePage.assertAggrementClosed(byoeData)
    await byoePage.maillkClient.assertProjectInvitationRecevied(byoeData)
    await expertsPage.assertPresenceByText(
      'Expert invitation is pending',
      'present'
    )
    await expertsPage.assertExpertLineitemStatus(byoeData, 'Invited')
    await expertsPage.filterExpertsBy('Invited')
    await expertsPage.assertExpertPresence(byoeData, true)
  })
})
