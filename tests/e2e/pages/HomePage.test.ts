import { expect } from '@playwright/test'
import { HomePageTester } from '../fixtures/pages/HomePageTester'
import { MainLayoutHeaderTester } from '../fixtures/pages/MainLayoutHeaderTester'
import { malTest } from '../fixtures/malTest'

malTest.describe('HomePage', () => {
    let header: MainLayoutHeaderTester
    let homePage: HomePageTester

    malTest.beforeEach(async({ page }) => {
        header = new MainLayoutHeaderTester(page)
        homePage = new HomePageTester(page)
        await homePage.goto()
    })

    malTest('page has title', async({ page }) => {
        await expect(page).toHaveTitle('MAL Cover CSS')
    })

    malTest('user is logged out', async() => {
        await homePage.assertIsLoggedIn(false)
        await header.assertIsLoggedIn(false)
    })

    malTest.describe('Mobile MainLayoutHeader', () => {
        malTest.beforeEach(async({ page }) => {
            await page.setViewportSize({
                width: 960,
                height: 800,
            })
        })

        malTest('expand btn is initially visible', async() => {
            await header.assertIsMobileMode(false)
        })

        malTest('expand btn opens header items', async() => {
            await header.expandMobileMenu()
            await header.assertIsMobileMode(true)
        })

        malTest('clicking anything in header closes header items', async() => {
            const numLinks = await header.getNumMenuLinks()
            for (let i = 1; i < numLinks; i++) {
                await header.expandMobileMenu()
                await header.assertIsMobileMode(true)

                await header.clickNthMenuLink(i + 1)
                await header.assertIsMobileMode(false)
            }
        })
    })
})
