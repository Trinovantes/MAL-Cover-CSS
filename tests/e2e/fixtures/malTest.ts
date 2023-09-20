import { expect, test as base } from '@playwright/test'
import { ApiMocker } from './mockers/ApiMocker'

type Fixtures = {
    apiMocker: ApiMocker
}

export const malTest = base.extend<Fixtures>({
    apiMocker: async({}, use) => {
        const apiMocker = new ApiMocker(false)
        await use(apiMocker)
    },

    page: async({ page, apiMocker }, use) => {
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

export const malAuthTest = malTest.extend({
    apiMocker: async({}, use) => {
        const apiMocker = new ApiMocker(true)
        await use(apiMocker)
    },
})
