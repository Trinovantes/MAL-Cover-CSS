import { expect } from '@playwright/test'
import { malTest } from '../fixtures/malTest.ts'

malTest.describe('SettingsPage', () => {
    malTest.beforeEach(async ({ settingsPage, apiMocker }) => {
        apiMocker.setIsLoggedIn(true)
        await settingsPage.goto()
    })

    malTest('unauth user cannot see page', async ({ settingsPage, page, apiMocker }) => {
        apiMocker.setIsLoggedIn(false)
        await settingsPage.goto()
        await expect(page).toHaveURL('/')
    })

    malTest('auth user can see page', async ({ page }) => {
        await expect(page).toHaveTitle(/Settings/)
    })

    malTest('auth user initially has no scrapped data', async ({ apiMocker, settingsPage }) => {
        await settingsPage.assertUsername(apiMocker.username)
        await settingsPage.assertLastChecked('N/A')
    })

    malTest('deleting user redirects back to homepage', async ({ page, settingsPage }) => {
        await settingsPage.deleteUser()
        await expect(page).toHaveURL('/')
    })
})
