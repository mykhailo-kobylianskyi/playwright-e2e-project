import { test as base } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { MailClient } from '../utils/mailosaur-client-manager'

const crypto = require('crypto')
const mailClient = new MailClient()

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

export function getRandomNumber(max) {
  return Math.floor(Math.random() * max + 1)
}

export function getRandomString(length) {
  return crypto.randomBytes(length).toString('hex')
}

type BYOE = {
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

type CLIENT = {
  uniqueId: string
  firstName: string
  lastName: string
  phoneNumber: string
  country: string
  timeZone: string
  email: string
}
export const test = base.extend<{ byoe: BYOE; client: CLIENT }>({
  byoe: {
    uniqueId: getRandomString(3),
    firstName: faker.name.firstName() + getRandomString(1),
    lastName: faker.name.lastName() + getRandomString(1),
    email: `${getRandomString(5)}@${mailClient.getServerDomain()}`,
    jobTitle: faker.name.jobTitle(),
    companyName: faker.company.companyName(),
    phoneNumber: faker.phone.phoneNumber('+38099#######'),
    rate: faker.finance.amount(0, 1000, 0),
    tags: [
      faker.company.catchPhrase(),
      faker.company.catchPhrase(),
      faker.company.catchPhrase(),
      faker.company.catchPhrase(),
    ],
    timeZone: 'Kiev',
    country: 'Ukraine',
    sourceOption: generateSource(),
    currency: generateCurrency(),
    angleOptionIndex: getRandomNumber(2),
    linkedinURl: 'https://www.linkedin.com/in/mykhailo-kobylianskyi-22023b133/',
  },
  client: {
    uniqueId: getRandomString(3),
    firstName: faker.name.firstName() + getRandomString(1),
    lastName: faker.name.lastName() + getRandomString(1),
    email: `${getRandomString(5)}@${mailClient.getServerDomain()}`,
    phoneNumber: faker.phone.phoneNumber('+38099#######'),
    timeZone: 'Kiev',
    country: 'Ukraine',
  },
})
