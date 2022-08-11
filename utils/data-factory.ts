import { faker } from '@faker-js/faker'
import { MailClient } from '../utils/mailosaur-client-manager'

const crypto = require('crypto')
const mailClient = new MailClient()

export function getRandomNumber(max) {
  return Math.floor(Math.random() * max + 1)
}

export function getRandomString(length) {
  return crypto.randomBytes(length).toString('hex')
}

export function generateRandomDataBYOE() {
  const uniqueId = getRandomString(3)
  const firstName = faker.name.firstName() + getRandomString(1)
  const lastName = faker.name.lastName() + getRandomString(1)
  const email = `${firstName}-${lastName}@${mailClient.getServerDomain()}`
  const jobTitle = faker.name.jobTitle()
  const companyName = faker.company.companyName()
  const phoneNumber = faker.phone.phoneNumber('+38099#######')
  const rate = faker.finance.amount(0, 1000, 0)
  const tags = [
    faker.company.catchPhrase(),
    faker.company.catchPhrase(),
    faker.company.catchPhrase(),
    faker.company.catchPhrase(),
  ]
  // cosnt  timeZone =  faker.address.timeZone(),
  // cosnt  country =  faker.address.country(),
  // HARDCODED UNTILL FIND OUT HOW TO REMOVE UNEXISTED TIMEZONE AND GEO FROM FAKER API
  const timeZone = 'Kiev'
  const country = 'Ukraine'
  const sourceOption = generateSource()
  const currency = generateCurrency()
  const angleOptionIndex = getRandomNumber(2)
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
    'ProSapient',
  ]
  return currencyList[Math.floor(Math.random() * currencyList.length)]
}
