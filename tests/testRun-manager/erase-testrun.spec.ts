import { test } from '@playwright/test'
require('dotenv').config()

test.describe('Erase test rail run', () => {
  const fs = require('fs')

  test('Setup test Run', async () => {
    fs.writeFileSync('utils/testrails/test-run.json', '{}')
  })
})
