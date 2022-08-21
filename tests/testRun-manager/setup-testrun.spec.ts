import { test } from '@playwright/test'
import TestRail from '@dlenroc/testrail'
import {
  getCurrentDayForDatepicker,
  getCurrentTimeFormated,
} from '../../utils/data-helpers'

test.describe('Setup test rail', () => {
  let testRun
  const fs = require('fs')
  const ENV = require('../../test-data/env-data.json')
  const api = new TestRail({
    host: 'https://prosapient.testrail.net',
    username: ENV.testRailEmail,
    password: ENV.testRailPassword,
  })

  test('Setup test Run', async () => {
    testRun = await api.addRun(2, {
      suite_id: 60,
      name: `BYOE AQA: ${getCurrentDayForDatepicker()} ${getCurrentTimeFormated(
        0
      )} `,
      description: `Test Server: ${ENV.URL}`,
      assignedto_id: 2,
      include_all: true,
    })
    fs.writeFileSync('test-data/test-run.json', JSON.stringify(testRun))
    console.warn(testRun.url)
  })
})
