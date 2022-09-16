import { Page, Locator, expect } from '@playwright/test'
import {
  calculateCallCostForExpertInvoice,
  formatForRegExp,
  getDateCurrent,
} from '../../utils/data-helpers'
import { BasePage } from '../BasePage'

export class Invoices extends BasePage {
  readonly searchInput: Locator
  readonly filterDropdown: Locator
  readonly invoiceHeaderCost: Locator
  readonly invoiceItemCost: Locator
  readonly invoiceStatus: Locator
  readonly invoiceDetails: Locator
  readonly invoiceStatusDropdown: Locator
  readonly invoiceHeaderExpertName: Locator
  readonly invoiceItemExpertName: Locator
  readonly invoiceHeaderDate: Locator
  readonly invoiceItemDate: Locator
  readonly invoiceID: Locator

  constructor(page: Page) {
    super(page)
    this.searchInput = page.locator('[name="filter[text]"]')
    this.filterDropdown = page.locator('.selectize-input >> nth=0')
    this.invoiceItemDate = page.locator('tr>>nth=2>>td>>nth=1')
    this.invoiceHeaderDate = page.locator('tr>>nth=1>>td>>nth=1')
    this.invoiceItemCost = page.locator('tr>>nth=2>>td>>nth=6')
    this.invoiceHeaderCost = page.locator('tr>>nth=1>>td>>nth=7')
    this.invoiceStatus = page.locator('tr>>nth=2>>td>>nth=4')
    this.invoiceDetails = page.locator('tr>>nth=2>>td>>nth=5')
    this.invoiceItemExpertName = page.locator('tr>>nth=2>>td>>nth=3')
    this.invoiceHeaderExpertName = page.locator('tr>>nth=1>>td>>nth=3')
    this.invoiceID = page.locator('tr>>nth=1>>td>>nth=0')
    this.invoiceStatusDropdown = page.locator(
      'tr>>nth=1>>td>>nth=5>>div>>nth=2'
    )
  }

  async changeInvoiceStatus(status: 'Paid' | 'Not paid') {
    await this.invoiceStatusDropdown.click()
    if (status == 'Not paid') {
      this.page.locator(`tr>>nth=1>>td>>nth=5>>div>>nth=6`).click()
    } else {
      this.page.locator(`tr>>nth=1>>td>>nth=5>>div>>nth=7`).click()
    }
    await expect(this.invoiceStatus).toHaveText(status)
  }

  async fileterInvoicesByStatus(status: 'Paid' | 'Not paid' | 'All statuses') {
    await this.filterDropdown.click()
    switch (status) {
      case 'Not paid': {
        this.page.locator(`.selectize-dropdown-content>div>>nth=1`).click()
        await expect(this.invoiceStatus).toHaveText(status)
        break
      }
      case 'Paid': {
        this.page.locator(`.selectize-dropdown-content>div>>nth=2`).click()
        await expect(this.invoiceStatus).toHaveText(status)
        break
      }
      default: {
        this.page.locator(`.selectize-dropdown-content>div>>nth=0`).click()
        break
      }
    }
  }

  async assertInvoiceIsNotClicable() {
    await this.assertElementIsNotClickable(this.invoiceHeaderDate)
    await this.assertElementIsNotClickable(this.invoiceItemDate)
    await this.assertElementIsNotClickable(this.invoiceDetails)
    await this.assertElementIsNotClickable(this.invoiceItemExpertName)
    await this.assertElementIsNotClickable(this.invoiceHeaderExpertName)
    await this.assertElementIsNotClickable(this.invoiceHeaderCost)
    await this.assertElementIsNotClickable(this.invoiceItemCost)
    await this.assertElementIsNotClickable(this.invoiceID)
  }

  async assertInvoiceDate() {
    expect(this.invoiceItemDate).toHaveText(
      new RegExp(`.*${getDateCurrent('invoice')}.*`)
    )
  }

  async assertInvoiceCostAndCurrency(data, callDuration: number) {
    /** get value of the actual cost from the page */
    let actualCost: string = await this.invoiceItemCost.textContent()
    /** remove , from the value  which present only on this page*/
    actualCost = actualCost.replace(',', '')
    /** calculate expected cost*/
    const expectedCost: string = `${data.currency.substring(
      0,
      data.currency.indexOf(' ')
    )}${
      /* expert rate devided to 60 and multipled to call duration in minutes
        number rounded to 2 decimals to biggest number (as in platfrom) */
      calculateCallCostForExpertInvoice(data.rate, callDuration)
    }`
    /**  assert that values match */
    if (actualCost != expectedCost) {
      throw new Error(
        `Costs  assertation failed. Actual is ${actualCost}. Expeted is ${expectedCost}`
      )
    }
  }
  async assertInvoiceStatus(status: 'Paid' | 'Not paid') {
    expect(this.invoiceStatus).toHaveText(status)
  }

  async assertInvoicePresence(user_email, byoeData) {
    expect(this.invoiceDetails).toHaveText(
      new RegExp(`.*BYOE.*${formatForRegExp(user_email)}.*`)
    )
    //101 rule check
    expect(this.invoiceDetails).not.toHaveText(
      new RegExp(`.*${formatForRegExp(byoeData.email)}.*`)
    )
  }

  async assertInvoiceAbsence(data) {
    await this.assertAbsenceByText(`${data.firstName} ${data.lastName}`)
  }

  async navigate() {
    await this.page.goto(`${this.baseURL}/admin/experts/invoices`, {
      waitUntil: 'domcontentloaded',
    })
  }

  async search(text) {
    await this.searchInput.type(text)
    await this.page.locator('tr>>nth=3').waitFor({ state: 'detached' })
  }

  async findExpertInvoice(client_email, data) {
    const invoiceIDElement = await this.page.locator(
      `tr:has-text('${data.firstName} ${data.lastName}')>>nth=0>>td>>nth=0`
    )
    await this.search(await invoiceIDElement.textContent())
    // 101 rule check - expert email should not be exposed.
    await this.assertInvoicePresence(client_email, data)
  }
}
