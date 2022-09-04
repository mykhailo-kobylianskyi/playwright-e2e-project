import { faker } from '@faker-js/faker'
import { Mail } from '../utils/mailosaur/index'

const crypto = require('crypto')
const mailClient = new Mail()

export function getRandomNumber(max) {
  return Math.floor(Math.random() * max + 1)
}

export function getRandomString(length) {
  return crypto.randomBytes(length).toString('hex')
}

export function generateRandomDataBYOE() {
  const uniqueId = getRandomString(3)
  let firstName = faker.name.firstName().replace(`'`, ``) + getRandomString(1)
  let lastName = faker.name.lastName().replace(`'`, ``) + getRandomString(1)
  const email = `${firstName}-${lastName}@${mailClient.getServerDomain()}`
  const jobTitle = faker.name.jobTitle()
  const companyName = faker.company.companyName() + getRandomString(1)
  const phoneNumber = faker.phone.phoneNumber('+38099#######')
  const rate = faker.finance.amount(0, 1000, 0)
  const tags = [
    faker.company.catchPhrase(),
    faker.company.catchPhrase(),
    faker.company.catchPhrase(),
    faker.company.catchPhrase(),
  ]
  // const timeZone = faker.address.timeZone()
  // const country = faker.address.country()
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
