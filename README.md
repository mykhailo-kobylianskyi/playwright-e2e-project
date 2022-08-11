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
- Run `npm run test-testrail` to start tests headless and with TestRails integration
- Run `npm run test-headless` to start tests headless
- Run `npm run test-debug` to start tests visually
