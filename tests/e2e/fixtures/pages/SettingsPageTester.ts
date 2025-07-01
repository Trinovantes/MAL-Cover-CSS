import { expect, type Locator, type Page } from '@playwright/test'

export class SettingsPageTester {
    readonly #page: Page
    readonly #username: Locator
    readonly #lastChecked: Locator
    readonly #deleteBtn: Locator

    constructor(page: Page) {
        this.#page = page
        this.#username = page.locator('.q-input:nth-child(1) input.q-field__native')
        this.#lastChecked = page.locator('.q-input:nth-child(2) input.q-field__native')
        this.#deleteBtn = page.locator('.q-btn', { has: page.locator('span:has-text("Unlink Account")') })
    }

    async goto() {
        await this.#page.goto('/settings')
    }

    async deleteUser() {
        await this.#deleteBtn.click()
    }

    async assertUsername(username: string) {
        await expect(this.#username).toHaveValue(username)
    }

    async assertLastChecked(lastChecked: string) {
        await expect(this.#lastChecked).toHaveValue(lastChecked)
    }
}
