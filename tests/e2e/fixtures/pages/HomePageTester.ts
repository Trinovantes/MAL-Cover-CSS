import { expect, type Locator, type Page } from '@playwright/test'

export class HomePageTester {
    readonly #page: Page
    readonly #heroUnitBtn: Locator

    constructor(page: Page) {
        this.#page = page
        this.#heroUnitBtn = page.locator('#app > main .hero-unit:first-child section .flex-hgap .q-btn:first-child')
    }

    async goto() {
        await this.#page.goto('/')
    }

    async assertIsLoggedIn(isLoggedIn: boolean) {
        if (isLoggedIn) {
            await expect(this.#heroUnitBtn).toHaveText('Go to Settings')
        } else {
            await expect(this.#heroUnitBtn).toHaveText(/log in/i)
        }
    }
}
