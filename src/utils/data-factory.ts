import { faker } from '@faker-js/faker'
import { Mail } from '../utils/mailosaur/index'

const crypto = require('crypto')
const mailClient = new Mail()

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomString(length) {
  return crypto.randomBytes(length).toString('hex')
}

export function generateRandomDataBYOE() {
  const uniqueId: string = getRandomString(3)
  const firstName: string =
    faker.name.firstName().replace(`'`, ``) + getRandomString(1)
  const lastName: string =
    faker.name.lastName().replace(`'`, ``) + getRandomString(1)
  const email: string = `${firstName}-${lastName}@${mailClient.getServerDomain()}`
  const jobTitle: string = faker.name.jobTitle()
  const companyName: string = faker.company.companyName() + getRandomString(1)
  const phoneNumber: string = faker.phone.phoneNumber('+38099#######')
  const rate: string = faker.finance.amount(0, 1000, 0)
  const tags: string[] = [
    faker.company.catchPhrase(),
    faker.company.catchPhrase(),
    faker.company.catchPhrase(),
    faker.company.catchPhrase(),
  ]
  // const timeZone = faker.address.timeZone()
  // const country = faker.address.country()
  // HARDCODED UNTILL FIND OUT HOW TO REMOVE UNEXISTED TIMEZONE AND GEO FROM FAKER API
  const timeZone: string = 'Kiev'
  const country: string = 'Ukraine'
  const sourceOption: string = generateSource()
  const currency: string = generateCurrency()
  const angleOptionIndex: number = getRandomNumber(1, 2)
  const linkedinURl =
    'https://www.linkedin.com/in/mykhailo-kobylianskyi-22023b133/'
  return {
    uniqueId,
    firstName,
    lastName,
    jobTitle,
    companyName,
    phoneNumber,
    rate,
    tags,
    timeZone,
    country,
    email,
    sourceOption,
    currency,
    angleOptionIndex,
    linkedinURl,
  }
}

export function generateCurrency() {
  const currencyList = [
    '$ (AUD)',
    'Fr. (CHF)',
    '€ (EUR)',
    '£ (GBP)',
    '¥ (JPY)',
    '$ (USD)',
  ]
  return currencyList[Math.floor(Math.random() * currencyList.length)]
}

export function generateSource() {
  const currencyList = [
    'AlphaSights',
    'APAC',
    'Atheneum Partners',
    'Coleman Research',
    'Definitive Healthcare',
    'Dialectica',
    'ExactData',
    'Guidepoint Global',
    'Hoovers',
    'Independently sourced',
    'InfoUSA/Edith Roman',
    'LinkedIn/Monster',
    'List from client',
    'NABU',
    'Online panel company',
    'platfrom',
  ]
  return currencyList[Math.floor(Math.random() * currencyList.length)]
}
