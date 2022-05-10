import { test, expect } from '@playwright/test'

test.describe('HomePage', () => {
    test.beforeEach(async({ page }) => {
        await page.goto('/')
    })

    test('page title', async({ page }) => {
        const title = page.locator('title')
        await expect(title).toHaveText('MAL Cover CSS')
    })

    test('user is logged out', async({ page }) => {
        const headerLogInBtn = page.locator('#app > header .header-items .q-btn')
        await expect(headerLogInBtn).toHaveText(/log in/i)

        const heroUnitBtn = page.locator('#app > main .hero-unit:first-child .q-btn:first-child')
        await expect(heroUnitBtn).toHaveText(/log in/i)
    })
})
