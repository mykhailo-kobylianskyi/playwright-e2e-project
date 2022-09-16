import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from '../../../BasePage'
import {
  calculateCallCostForClientInvoice,
  convertCurrencyCodeToSign,
} from '../../../../utils/data-helpers'

const clientID = process.env.CLIENT_ID

export class InvoicingTab extends BasePage {
  readonly createInvoiceButton: Locator
  readonly submitOfficeButton: Locator

  constructor(page: Page) {
    super(page)
    this.createInvoiceButton = page.locator('button:has-text("Create invoice")')
    this.submitOfficeButton = page.locator('[data-test-id="create-invoice"]')
  }

  async getInvoiceItemByExpertName(data): Promise<Locator> {
    return this.page.locator(
      `tr:has-text('${data.firstName} ${data.lastName}')`
    )
  }

  async assertInvoicePresence(data, state: 'present' | 'absent') {
    await this.assertPresenceByText(
      `${data.firstName} ${data.lastName} (BYOE)`,
      state
    )
  }

  async assertInvoiceDate(data, date) {
    const invocieWebElement = await this.getInvoiceItemByExpertName(data)
    const dateWebelement = invocieWebElement.locator('>td>>nth=1')
    await expect(dateWebelement).toHaveText(date)
  }

  async cancelInvoice() {
    await this.page.locator('button:has-text("Cancel")>>nth=0').click()
  }
  async downloadCSV() {
    await this.assertFileDownloaded(
      this.page.locator('button:has-text("CSV")>>nth=0')
    )
  }
  async downloadPDF() {
    await this.assertFileDownloaded(
      this.page.locator('button:has-text("PDF")>>nth=0')
    )
  }

  async createInvoice(data) {
    const invocieWebElement = await this.getInvoiceItemByExpertName(data)
    const checkbox = invocieWebElement.locator('>td>>nth=0')
    await checkbox.click()
    await this.createInvoiceButton.click()
    await this.page
      .locator('text=Choose the Office to Create an Invoice')
      .waitFor({ state: 'attached' })

    await this.submitOfficeButton.click()
    await this.assertSuccessAllert('The invoice was successfully created')
  }

  async getOfficeFromInvoice(data): Promise<string> {
    const invocieWebElement = await this.getInvoiceItemByExpertName(data)
    return await invocieWebElement.locator('>td>>nth=4').textContent()
  }

  async assertInvoiceUnits(data, unitPrice: string) {
    /* get untis from invoice item */
    const actualUnits = await this.getInvoiceUnit(data)
    /* get cost  from invoice item  as a string */
    const invoiceCost: string = await this.getInvoiceCost(data)
    /** Trim currency and convert string to the number  */
    let invoiceCostValue: number
    if (invoiceCost[0] === 'A') {
      invoiceCostValue = parseFloat(invoiceCost.substring(2))
    } else {
      invoiceCostValue = parseFloat(invoiceCost.substring(1))
    }
    /* calculate expected units in invoice */
    const expectedUnits = Math.round((invoiceCostValue / +unitPrice) * 10) / 10
    expect(+expectedUnits).toEqual(+actualUnits)
  }

  async getInvoiceCost(data): Promise<string> {
    /* getting invoice item by expert name */
    const invocieWebElement = await this.getInvoiceItemByExpertName(data)
    /* getting Actual cost from invoice item */
    let actualCost: string = await invocieWebElement
      .locator('td>>span>>nth=3')
      .textContent()
    /** Removing excesive  coms sign from value */
    actualCost = actualCost.replace(',', '')
    return actualCost
  }

  async getInvoiceUnit(data): Promise<string> {
    /* getting invoice item by expert name */
    const invocieWebElement = await this.getInvoiceItemByExpertName(data)
    /* getting Actual cost from invoice item */
    const units: string = await invocieWebElement
      .locator('td>>span>>nth=2')
      .textContent()
    return units
  }

  async assertInvoiceCost(data, callDuration: number, officeCurrency: string) {
    const actualInvoiceCost = this.getInvoiceCost(data)
    const expectedInvoiceCost = await calculateCallCostForClientInvoice(
      data,
      callDuration,
      officeCurrency
    )
    /*assertetion that actual and expected cost are aproximatly the same +- 10 */
    if (Math.abs(+actualInvoiceCost - expectedInvoiceCost) > 10) {
      throw new Error(
        `Costs  assertation failed. Actual is ${actualInvoiceCost}. Expeted is ${expectedInvoiceCost}`
      )
    }
  }

  async assertInvoiceIsNotClickable(data) {
    const invocieWebElement = await this.getInvoiceItemByExpertName(data)
    const dateWebelement = invocieWebElement.locator('>td>>nth=1')
    const chargeCodeWebelement = invocieWebElement.locator('>td>>nth=3')
    const projectOffice = invocieWebElement.locator('>td>>nth=4')
    const clientUserWebelement = invocieWebElement.locator('>td>>nth=5')
    const expertWebelement = invocieWebElement.locator('>td>>nth=6')
    const costWebelement = invocieWebElement.locator('>td>>nth=7')
    await this.assertElementIsNotClickable(dateWebelement)
    await this.assertElementIsNotClickable(chargeCodeWebelement)
    await this.assertElementIsNotClickable(projectOffice)
    await this.assertElementIsNotClickable(clientUserWebelement)
    await this.assertElementIsNotClickable(expertWebelement)
    await this.assertElementIsNotClickable(costWebelement)
  }

  async assertProjectNameNotDisaplyExpert(data) {
    const invocieWebElement = await this.getInvoiceItemByExpertName(data)
    const projectWebelement = invocieWebElement.locator('>td>>nth=2')
    await projectWebelement.click()
    /* Checking that user redirected tpo the project pages */
    await expect(this.page).toHaveURL(
      new RegExp(`^${this.baseURL}\/admin\/projects\/.*`)
    )
    /* Checking that user redirected  only to Project page and not to some inner pages like /experts   */
    await expect(this.page).not.toHaveURL(
      new RegExp(`^${this.baseURL}\/admin\/projects\/.*\/.*`)
    )
  }

  async assertInvoiceUserName(expertData, clientName: string) {
    const invocieWebElement = await this.getInvoiceItemByExpertName(expertData)
    const clientUserWebelement = invocieWebElement.locator('>td>>nth=5')
    expect(clientUserWebelement).toHaveText(clientName)
  }

  async assertInvoiceCurrency(data, expectedCurrency: string) {
    const currency = convertCurrencyCodeToSign(expectedCurrency)
    /* getting invoice actual cost  */
    const actualCost = (await this.getInvoiceCost(data)).toString()
    expect(actualCost[0]).toEqual(currency)
  }

  async navigate() {
    await this.page.goto(
      `${this.baseURL}/admin/clients/${clientID}/invoicing`,
      {
        waitUntil: 'domcontentloaded',
      }
    )
    await this.page.locator('tr>>nth=1').waitFor({ state: 'attached' })
  }
}
