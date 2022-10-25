import { expect, test as base } from '@playwright/test'
import { MyAnimeListMocker } from './MyAnimeListMocker'
import { PageHeaderTester } from './PageHeaderTester'

type Fixtures = {
    malMocker: MyAnimeListMocker
}

export const malTest = base.extend<Fixtures>({
    // eslint-disable-next-line no-empty-pattern
    malMocker: async({ }, use) => {
        const malMocker = new MyAnimeListMocker()
        await use(malMocker)
    },

    page: async({ page, malMocker }, use) => {
        page.on('pageerror', (error) => {
            throw new Error(`[pageerror] ${error.name}: ${error.message}`)
        })

        page.on('console', (msg) => {
            if (msg.type() !== 'error') {
                return
            }

            throw new Error(`[pageerror] ${msg.text()}`)
        })

        await malMocker.interceptApiRequests(page)

        // Wait until the page is finished being tested
        await use(page)

        await expect(page.locator('.q-notification.bg-negative')).toBeHidden()
    },
})

export const malAuthTest = malTest.extend({
    page: async({ page }, use) => {
        await page.goto('/')

        const pageHeader = new PageHeaderTester(page)
        await pageHeader.clickLogin() // Goes to api.myanimelist.net -> /api/oauth -> /settings

        await page.waitForURL('/settings')

        // Wait until the page is finished being tested
        await use(page)
    },
})
