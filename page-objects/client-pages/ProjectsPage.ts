import { Page, Locator, expect } from '@playwright/test'
import { getCurrentDay, getCurrentTimeFormated } from '../../utils/data-helpers'
import { BasePage } from '../BasePage'

export class ProjectsPage extends BasePage {
  readonly searchProjectInput: Locator
  readonly firstProject: Locator

  constructor(page: Page) {
    super(page)
    this.searchProjectInput = page.locator(
      '[data-test-id="live-search-project"]'
    )
    this.firstProject = page.locator('[data-test-id="project-name"] >> nth=0')
  }

  async searchForProject(name) {
    await this.searchProjectInput.type(name)
    await this.page.keyboard.press('Enter')
  }

  async openProject(name) {
    this.searchForProject(name)
    this.firstProject.click()
  }

  async getToProjectsPage(url) {
    await this.page.goto(url + '/client/projects')
  }
}
