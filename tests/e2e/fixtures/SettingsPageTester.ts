import { expect, Locator, Page } from '@playwright/test'

export class SettingsPageTester {
    readonly #page: Page
    readonly #username: Locator
    readonly #lastChecked: Locator

    constructor(page: Page) {
        this.#page = page
        this.#username = page.locator('.q-input:nth-child(1) input.q-field__native')
        this.#lastChecked = page.locator('.q-input:nth-child(2) input.q-field__native')
    }

    async goto() {
        await this.#page.goto('/settings')
    }

    async assertUsername(username: string) {
        await expect(this.#username).toHaveValue(username)
    }

    async assertLastChecked(lastChecked: string) {
        await expect(this.#lastChecked).toHaveValue(lastChecked)
    }
}
