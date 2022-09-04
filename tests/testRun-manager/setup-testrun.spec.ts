import { test } from '@playwright/test'
import TestRail from '@dlenroc/testrail'
import {
  getDateCurrent,
  getCurrentTimeFormated,
} from '../../utils/data-helpers'
require('dotenv').config()

test.describe('Setup test rail', () => {
  let testRun
  const fs = require('fs')
  const api = new TestRail({
    host: 'https://prosapient.testrail.net',
    username: process.env.TEST_RAILS_EMAIL,
    password: process.env.TEST_RAILS_PASSWORD,
  })

  test('Setup test Run', async () => {
    testRun = await api.addRun(2, {
      suite_id: 60,
      name: `BYOE AQA: ${getDateCurrent('default')} ${getCurrentTimeFormated(
        0
      )} `,
      description: `Test Server: ${process.env.URL}`,
      assignedto_id: 2,
      include_all: true,
    })
    fs.writeFileSync(
      '../../utils/testrails/test-run.json',
      JSON.stringify(testRun)
    )
    console.warn(testRun.url)
  })
})
