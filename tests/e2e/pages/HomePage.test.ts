import { expect } from '@playwright/test'
import { HomePageTester } from '../fixtures/HomePageTester'
import { PageHeaderTester } from '../fixtures/PageHeaderTester'
import { malTest } from '../fixtures/malTest'

malTest.describe('HomePage', () => {
    let pageHeader: PageHeaderTester
    let homePage: HomePageTester

    malTest.beforeEach(async({ page }) => {
        pageHeader = new PageHeaderTester(page)
        homePage = new HomePageTester(page)
        await homePage.goto()
    })

    malTest('page has title', async({ page }) => {
        await expect(page).toHaveTitle('MAL Cover CSS')
    })

    malTest('user is logged out', async() => {
        await homePage.assertIsLoggedIn(false)
        await pageHeader.assertIsLoggedIn(false)
    })

    malTest.describe('Mobile MainLayoutHeader', () => {
        malTest.beforeEach(async({ page }) => {
            await page.setViewportSize({
                width: 960,
                height: 800,
            })
        })

        malTest('expand btn is initially visible', async() => {
            await pageHeader.assertIsMobileMode(false)
        })

        malTest('expand btn opens header items', async() => {
            await pageHeader.expandMobileMenu()
            await pageHeader.assertIsMobileMode(true)
        })

        malTest('clicking anything in header closes header items', async() => {
            const numLinks = await pageHeader.getNumMenuLinks()
            for (let i = 1; i < numLinks; i++) {
                await pageHeader.expandMobileMenu()
                await pageHeader.assertIsMobileMode(true)

                await pageHeader.clickNthMenuLink(i + 1)
                await pageHeader.assertIsMobileMode(false)
            }
        })
    })
})
