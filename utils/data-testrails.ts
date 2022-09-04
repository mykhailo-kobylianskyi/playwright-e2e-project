import TestRail from '@dlenroc/testrail'
const crypto = require('crypto')
const testRun = require('../utils/testrails/test-run.json')
const api = new TestRail({
  host: process.env.TEST_RAILS_HOST,
  username: process.env.TEST_RAILS_EMAIL,
  password: process.env.TEST_RAILS_PASSWORD,
})

export async function getTestCase(testInfo) {
  let filteredTestCases = await api.getCases(testRun.project_id, {
    suite_id: testRun.suite_id,
    filter: testInfo.title,
    limit: 1,
  })
  return filteredTestCases[0]
}

export function statusCode(status) {
  switch (status) {
    case 'passed':
      return 1
    case 'skipped':
      return 4
    default:
      return 5
  }
}
export async function updateTestCase(testCase, status, testInfo) {
  let result = await api.addResultForCase(testRun.id, testCase.id, {
    status_id: status,
  })
  if (status == 5) {
    await api.addAttachmentToResult(result.id, {
      name: testInfo.attachments[0].name,
      value: testInfo.attachments[0].body,
    })
  }
}
export async function sendTestStatusAPI(testInfo) {
  if (testRun.id != undefined) {
    const testCase = await getTestCase(testInfo)
    const status = statusCode(testInfo.status)
    await updateTestCase(testCase, status, testInfo)
  }
}
