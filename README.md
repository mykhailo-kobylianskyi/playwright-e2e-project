**Table of Contents**

[TOC]

## Set Up testing server

- Create client with BYOE feature ON
- Eneble `Source` feature in DB for testing client

## Development

### Instalation

- Run `npm init` in the proeject folder
- Run `npm install prettier` to install prettier
- Run `npm install @playwright/test` to install Playwright
- Run `npx playwirght install` to install default browsers for tests

### Before running tests

- Create .env file in project root

## Run tests

- Run `npm run report` to open report in browser
- Run `npm run test-lk` to start lk version of tests w/o TestRails integration
- Run `npm run test-platform` to start Platfrom version of tests w/o TestRails integration
- Run `npm run test-testrail` to start Platfrom tests with TestRails integration
- Run `npm run test-testrail-update` to start Platfrom tests with TestRails integration where suite already precreated.
  _Before running `testrail-update` command you need to update `src/utils/testrails/test-run.json` file by adding following parameters in JSON format._

```json
{ "id": 198, "suite_id": 27, "project_id": 2 }
```

_id - is a TestRun ID_
