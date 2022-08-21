# Automation Playwright tests

## Prerequisites

- Install npm

## Development

- Run `npm init` in the proeject folder
- Run `npm install prettier` to install prettier
- Run `npm install @playwright/test` to install Playwright
- Run `npx playwirght install` to install default browsers for tests

## Before running tests

- Create a json file `env-data.json` in `/test-data` folder.
- In the same folder present `env-data.example` with file structure.
- Copy from example and specify nececery parameters in `env-data.json`

## Run tests

- Run `npm run report` to open report in browser
- Run `npm run test-plt-testrail` to start plt tests with TestRails integration
- Run `npm run test-plt` to start plt version of tests w/o TestRails integration
- Run `npm run test-lk` to start LK version of tests w/o TestRails integration
