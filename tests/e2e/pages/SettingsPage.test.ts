import { expect } from '@playwright/test'
import { SettingsPageTester } from '../fixtures/SettingsPageTester'
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

    malAuthTest('auth user initially has no scrapped data', async() => {
        await settingsPage.assertUsername('test_mal_user')
        await settingsPage.assertLastChecked('N/A')
    })
})
