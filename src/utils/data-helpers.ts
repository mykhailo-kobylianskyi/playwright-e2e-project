const CC = require('currency-converter-lt')

export function convertCurrency(from: string, to: string, ammount: number) {
  let currencyConverter = new CC()
  const fromCurrency = getCurrencyCode(from)
  const result = currencyConverter
    .from(fromCurrency)
    .to(to)
    .amount(ammount)
    .convert()
    .then((response) => {
      return response
    })

  return result
}

export function calculateCallCostForExpertInvoice(
  rate: number,
  callDuration: number
): string {
  const cost: string = (
    Math.round(((rate / 60) * callDuration + Number.EPSILON) * 100) / 100
  ).toString()
  if (cost.length - cost.indexOf('.') < 3) return cost + '0'
  else return cost
}

export async function calculateCallCostForClientInvoice(
  data,
  callDuration: number,
  officeCurrency: string
): Promise<number> {
  /*calculate fee  - considered call duration and expert currency */
  const expectedFee = calculateExpertFee(officeCurrency, callDuration)
  /* calculate expected cost by geting rate and multiply on call duration */
  const expectedCallCost = (+data.rate / 60) * callDuration
  /* Converting expected cost into Office currency and after add fee */
  const convertedCallCost = +(await convertCurrency(
    data.currency,
    officeCurrency,
    expectedCallCost
  ))

  return convertedCallCost + expectedFee
}

export function calculateExpertFee(
  expertCurrency: string,
  callDuration: number
): number {
  enum FeeRates {
    USD = 100,
    AUD = 140,
    CHF = 95,
    GBP = 74,
    EUR = 90,
    JPY = 5700,
  }
  switch (expertCurrency) {
    case 'USD': {
      if (callDuration > 30) return FeeRates.USD
      else return FeeRates.USD / 2
    }
    case 'AUD': {
      if (callDuration > 30) return FeeRates.AUD
      else return FeeRates.AUD / 2
    }
    case 'CHF': {
      if (callDuration > 30) return FeeRates.CHF
      else return FeeRates.CHF / 2
    }
    case 'GBP': {
      if (callDuration > 30) return FeeRates.GBP
      else return FeeRates.GBP / 2
    }
    case 'EUR': {
      if (callDuration > 30) return FeeRates.EUR
      else return FeeRates.EUR / 2
    }
    default: {
      if (callDuration > 30) return FeeRates.JPY
      else return FeeRates.JPY / 2
    }
  }
}

//taking only currency code from string. I.E "$ (USD)" => "USD"
export function getCurrencyCode(currency: string) {
  const result = currency.substring(
    currency.indexOf('(') + 1,
    currency.indexOf(')')
  )
  return result
}

export function removeSpaces(string) {
  return string.replace(/\s+/g, '')
}
export function convertCurrencyCodeToSign(currency: string): string {
  switch (currency) {
    case 'USD':
      return '$'
    case 'AUD':
      return 'A'
    case 'CHF':
      return 'Fr.'
    case 'GBP':
      return '£'
    case 'EUR':
      return '€'
    default:
      return '¥'
  }
}

export function formatForRegExp(string: string) {
  var newstring = string.replace(`.`, `\\.`)
  newstring = newstring.replace(`+`, `\\+`)
  return newstring
}

export function getCurrentTimeFormated(hoursInFuture: number) {
  let minutesValue: string
  let hoursValue: string
  const time = new Date()
  const hour: any = (time.getHours() + hoursInFuture) % 24
  const minute: any = 15 * Math.floor(time.getMinutes() / 15)
  if (hour < 10) {
    hoursValue = '0' + hour.toString()
  } else {
    hoursValue = hour.toString()
  }
  if (minute < 10) {
    minutesValue = '0' + minute.toString()
  } else {
    minutesValue = minute.toString()
  }
  return `${hoursValue}:${minutesValue}`
}

export function mapCurrencyWithIndex(currency) {
  switch (currency) {
    case '$ (AUD)': {
      return 1
    }
    case 'Fr. (CHF)': {
      return 2
    }
    case '€ (EUR)': {
      return 3
    }
    case '£ (GBP)': {
      return 4
    }
    case '¥ (JPY)': {
      return 5
    }
    default: {
      return 6
    }
  }
}

export async function setLocalStorage(page) {
  await page.addInitScript(() => {
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0')
    var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    var yyyy = today.getFullYear()
    window.localStorage.setItem(
      'platfrom-hide-attestation-v1',
      `${dd}-${mm}-${yyyy}`
    )
  })
}
export function getDateCurrent(option: 'datepicker' | 'invoice' | 'default') {
  let today = new Date()
  let dd = String(today.getDate()).padStart(2, '0')
  let mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
  let yyyy = today.getFullYear()
  let apendix = 'th'
  if (dd[1] == '1') {
    apendix = 'st'
  }
  if (dd[1] == '2') {
    apendix = 'nd'
  }
  if (dd[1] == '3') {
    apendix = 'rd'
  }
  let month
  switch (mm) {
    case '01': {
      month = 'January'
      break
    }
    case '02': {
      month = 'February'
      break
    }
    case '03': {
      month = 'March'
      break
    }
    case '04': {
      month = 'April'
      break
    }
    case '05': {
      month = 'May'
      break
    }
    case '06': {
      month = 'June'
      break
    }
    case '07': {
      month = 'July'
      break
    }
    case '08': {
      month = 'August'
      break
    }
    case '09': {
      month = 'September'
      break
    }
    case '10': {
      month = 'October'
      break
    }
    case '11': {
      month = 'November'
      break
    }
    case '12': {
      month = 'December'
      break
    }
    default: {
      month = 'not found'
      break
    }
  }
  switch (option) {
    case 'datepicker':
      return `${dd}${apendix} ${month} ${yyyy}`

    case 'invoice':
      if (dd[0] === '0') {
        dd = dd.slice(1)
      }
      return `${dd} ${month.slice(0, 3)} ${yyyy}`
    default:
      if (dd[0] == '0') {
        dd = dd.substring(1)
      }
      return `${dd} ${month} ${yyyy}`
  }
}
