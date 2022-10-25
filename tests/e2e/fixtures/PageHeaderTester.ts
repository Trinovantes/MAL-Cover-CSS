import { expect, Locator, Page } from '@playwright/test'

export class PageHeaderTester {
    readonly #loginBtn: Locator
    readonly #logoutBtn: Locator

    readonly #menuExpandBtn: Locator
    readonly #menuContainer: Locator
    readonly #menuLinks: Locator

    constructor(page: Page) {
        const header = page.locator('.main-layout-header')

        this.#loginBtn = header.locator('.header-items .q-btn:has-text("Log In")')
        this.#logoutBtn = header.locator('.header-items .q-btn:has-text("Log Out")')

        this.#menuExpandBtn = header.locator('.header-logo .q-btn')
        this.#menuContainer = header.locator('.header-items')
        this.#menuLinks = header.locator('.header-items a')
    }

    async clickLogin() {
        await this.#loginBtn.click()
    }

    async clickLogout() {
        await this.#logoutBtn.click()
    }

    async assertIsLoggedIn(isLoggedIn: boolean) {
        if (isLoggedIn) {
            await expect(this.#logoutBtn).toBeVisible()
        } else {
            await expect(this.#loginBtn).toBeVisible()
        }
    }

    async getNumMenuLinks() {
        return await this.#menuLinks.count()
    }

    async assertIsMobileMode(isMenuExpanded: boolean) {
        await expect(this.#menuExpandBtn).toBeVisible()
        await expect(this.#menuContainer).toBeVisible({ visible: isMenuExpanded })
    }

    async expandMobileMenu() {
        await this.#menuExpandBtn.click()
        await expect(this.#menuContainer).toBeVisible()
    }

    async clickNthMenuLink(n = 1) {
        await this.#menuLinks.nth(n - 1).click()
    }
}
