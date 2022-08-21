import { test } from '@playwright/test'

test.describe('Erase test rail run', () => {
  const fs = require('fs')
  test('Setup test Run', async () => {
    fs.writeFileSync('test-data/test-run.json', '{}')
  })
})
