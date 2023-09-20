import { expect } from '@playwright/test'
import { SettingsPageTester } from '../fixtures/pages/SettingsPageTester'
import { malAuthTest, malTest } from '../fixtures/malTest'

malTest.describe('SettingsPage', () => {
    let settingsPage: SettingsPageTester

    malTest.beforeEach(async({ page }) => {
        settingsPage = new SettingsPageTester(page)
        await settingsPage.goto()
    })

    malTest('unauth user cannot see page', async({ page }) => {
        await expect(page).toHaveURL('/')
    })

    malAuthTest('auth user can see page', async({ page }) => {
        await expect(page).toHaveTitle(/Settings/)
    })

    malAuthTest('auth user initially has no scrapped data', async({ apiMocker }) => {
        await settingsPage.assertUsername(apiMocker.username)
        await settingsPage.assertLastChecked('N/A')
    })

    malAuthTest('deleting user redirects back to homepage', async({ page }) => {
        await settingsPage.deleteUser()
        await expect(page).toHaveURL('/')
    })
})
