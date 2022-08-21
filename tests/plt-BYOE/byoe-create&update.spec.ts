import { ByoePage } from '../../page-objects/client-pages/project-pages/BYOePage'
import { LoginPage } from '../../page-objects/public-pages/LoginPage'
import { ExpertsPage } from '../../page-objects/client-pages/project-pages/ProjectExpertsPage'
import { generateRandomDataBYOE } from '../../utils/data-factory'
import { sendTestStatusAPI } from '../../utils/data-testrails'
import { test } from '../../fixtures/generator'

test.describe.parallel.only('Create and update BYOE', () => {
  let byoePage: ByoePage
  let loginPage: LoginPage
  let expertsPage: ExpertsPage
  const ENV = require('../../test-data/env-data.json')

  test.beforeEach(async ({ page, byoe }, testInfo) => {
    loginPage = new LoginPage(page)
    byoePage = new ByoePage(page)
    expertsPage = new ExpertsPage(page)
    await loginPage.loginWithEmail(ENV)

    await loginPage.loginAsUser(ENV.URL, ENV.clientFullMode.client_user_ID)
    await expertsPage.openExpertTab(ENV.URL, ENV.clientFullMode.project1_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    console.log(testInfo.title)
    console.log(byoe)
  })

  test.afterEach(async ({}, testInfo) => {
    loginPage.addScreenshotUponFailure(testInfo)
    await sendTestStatusAPI(testInfo)
  })

  test('Check that user is able to add BYOE', async ({ byoe }) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await expertsPage.asserExpertInProejct(byoe)
  })

  test('Check that T&Cs modal is opened after a user click on the Continue button', async ({
    byoe,
  }) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.submitFormWithContinueButton()
    await byoePage.assertSubmitAgreementButtonEnebled(false)
    await byoePage.checkAggrementCheckbox()
    await byoePage.assertSubmitAgreementButtonEnebled(true)
  })

  test('Check that Expert Source is available on the BYOE Add form', async ({
    byoe,
  }) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.assertSelectorFieldPresence
    await byoePage.assertSelectorFieldPresence('Source')
  })

  test('Check that Expertise tags field is available on the Add BYOE form', async ({
    byoe,
  }) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.assertSelectorFieldPresence('Expertise tags (optional)')
  })

  test('Check system behaviour when user adds BYOE expert that is already added to another client project', async ({
    byoe,
  }) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await expertsPage.asserExpertInProejct(byoe)
    await expertsPage.openExpertTab(ENV.URL, ENV.clientFullMode.project2_ID)
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.assertEmailAddressWarning()
    await byoePage.assertAutocompleteFormValues(byoe)
  })

  test('Check that client can remove the email address with the X icon on the BYOE add form', async ({
    byoe,
  }) => {
    await byoePage.assertAddingFormUnavailable()
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.assertBYOEFormAvailable()
    await byoePage.submitFormWithContinueButton()
    await byoePage.submitFormWithContinueButton()
    await byoePage.assertMandatoryFieldsOnBYOEForm()
    await byoePage.clearBYOEEmailField()
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await expertsPage.asserExpertInProejct(byoe)
  })

  test('Check that call details field are mandatory', async ({ byoe }) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.enableCallScheduleFields()
    await byoePage.submitFormWithContinueButton()
    await byoePage.assertMandatoryFieldsOnScheduleCallForm()
  })

  test('Check that client is able to schedule a call during adding BYOE', async ({
    byoe,
  }) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.provideSchedulingDetails('45 minutes')
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await byoePage.assertSuccessAllert('Call was scheduled')
    await expertsPage.assertExpertStatus('Call scheduled', byoe)
    await expertsPage.mailClient.assertPlaceholderRecevied(byoe)
    // await expertsPage.mailClient.assertRemindeRecevied( byoe)
  })

  test('Check that client is not prevent to schedule a conflicting call with internal expert during adding expert', async ({
    page,
    byoe,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.provideSchedulingDetails('45 minutes')
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await byoePage.assertSuccessAllert('Call was scheduled')
    byoe = generateRandomDataBYOE()
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.provideSchedulingDetails('30 minutes')
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await byoePage.assertSuccessAllert('Call was scheduled')
    await byoePage.mailClient.assertPlaceholderRecevied(byoe)
  })

  test('Check that message ‘Please note, you have another call at this timeslot’ is shown on the  form if client has a conflicting call during adding', async ({
    page,
    byoe,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.provideSchedulingDetails('45 minutes')
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await byoePage.assertSuccessAllert('Call was scheduled')
    byoe = generateRandomDataBYOE()
    await byoePage.assertExpertTabDisplayed()
    await byoePage.navigateToByoeForm()
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.provideSchedulingDetails('30 minutes')
    await byoePage.assertConflictCallWarning()
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await byoePage.assertSuccessAllert('Call was scheduled')
    await byoePage.mailClient.assertPlaceholderRecevied(byoe)
  })

  test('Check that  Additional service message is shown after setting Rate for the BYOE', async ({
    byoe,
  }) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.openRateModal()
    await byoePage.assertRateModal()
  })

  test('Check How it works button and BYOE informative modal on BYOE add form', async ({
    byoe,
  }) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.openHowItWorksModal()
    await byoePage.assertHowItWorksModal()
  })

  test('Check that user is able to edit the expert profile after clicking on the Edit profile icon', async ({
    page,
    byoe,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await expertsPage.searchForExpert(byoe, 'detailed')
    await expertsPage.openEditExpertForm()
    await byoePage.assertFormValues(byoe)
    await byoePage.assertBYOEFormAvailable()
    await byoePage.clearForm()
    byoe = generateRandomDataBYOE()
    await byoePage.fillForm(byoe)
    await byoePage.submitFormWithSaveButton()
    await expertsPage.asserExpertCardOpened(byoe)
  })

  test('Check mandatory fields for the BYOE form', async ({
    page,
    byoe,
  }, testInfo) => {
    await byoePage.fillEmailInputWithUniqueEmail(byoe)
    await byoePage.fillForm(byoe)
    await byoePage.submitFormWithContinueButton()
    await byoePage.agreeOnAgreement()
    await expertsPage.searchForExpert(byoe, 'detailed')
    await expertsPage.openEditExpertForm()
    await byoePage.assertFormValues(byoe)
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
