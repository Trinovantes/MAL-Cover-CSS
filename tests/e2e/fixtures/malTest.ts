import { expect, test as base } from '@playwright/test'
import { ApiMocker } from './mockers/ApiMocker.ts'
import { SettingsPageTester } from './pages/SettingsPageTester.ts'
import { HomePageTester } from './pages/HomePageTester.ts'
import { MainLayoutHeaderTester } from './pages/MainLayoutHeaderTester.ts'

type Fixtures = {
    apiMocker: ApiMocker
    header: MainLayoutHeaderTester
    homePage: HomePageTester
    settingsPage: SettingsPageTester
}

export const malTest = base.extend<Fixtures>({
    apiMocker: async ({}, use) => {
        const apiMocker = new ApiMocker()
        await use(apiMocker)
    },

    header: async ({ page }, use) => {
        const tester = new MainLayoutHeaderTester(page)
        await use(tester)
    },

    homePage: async ({ page }, use) => {
        const tester = new HomePageTester(page)
        await use(tester)
    },

    settingsPage: async ({ page }, use) => {
        const tester = new SettingsPageTester(page)
        await use(tester)
    },

    page: async ({ page, apiMocker }, use) => {
        page.on('pageerror', (error) => {
            if (error.stack?.includes('webpackHotUpdate')) {
                return
            }

            throw new Error(`[pageerror] ${error.message} ${error.stack}`)
        })

        page.on('console', (msg) => {
            if (msg.type() !== 'error') {
                return
            }

            if (msg.text().includes('401 (Unauthorized)')) {
                return
            }

            if (msg.text().includes('403 (Forbidden)')) {
                return
            }

            if (msg.text().includes('404 (Not Found)')) {
                return
            }

            throw new Error(`[consoleerror] ${msg.text()}`)
        })

        await apiMocker.interceptApiRequests(page)

        // Wait until the page is finished being tested
        await use(page)

        // Make sure there are now error notifications
        await expect(page.locator('.q-notification.bg-negative')).toBeHidden()
    },
})
