import { test, expect, Page } from '@playwright/test'

test.describe('MainLayoutHeader', () => {
    test.beforeEach(async({ page }) => {
        await page.goto('/')
        await page.setViewportSize({
            width: 960,
            height: 800,
        })
    })

    test.describe('initial state', () => {
        test('expand btn is visible', async({ page }) => {
            const { expandBtn } = getHeader(page)
            await expect(expandBtn).toBeVisible()
        })

        test('header items are hidden', async({ page }) => {
            const { headerItems } = getHeader(page)
            await expect(headerItems).not.toBeVisible()
        })
    })

    test('expand btn opens header items', async({ page }) => {
        const { expandBtn, headerItems } = getHeader(page)
        await expandBtn.click()
        await expect(headerItems).toBeVisible()
    })

    test('clicking anything in header closes header items', async({ page }) => {
        const { expandBtn, headerItems } = getHeader(page)
        const links = page.locator('#app > header a')

        for (let i = 0; i < await links.count(); i++) {
            const link = links.nth(i)

            await expandBtn.click()
            await expect(headerItems).toBeVisible()

            await link.click()
            await expect(headerItems).not.toBeVisible()
        }
    })
})

function getHeader(page: Page) {
    const expandBtn = page.locator('#app > header .header-logo .q-btn')
    const headerItems = page.locator('#app > header .header-items')

    return {
        expandBtn,
        headerItems,
    }
}
