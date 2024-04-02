import { RedirectResponse, SuccessResponse, UserResponse } from '@/web/server/interfaces/ApiResponse'
import { Page } from '@playwright/test'
import { BuildSecret, getBuildSecret } from 'build/BuildSecret'

const apiUrl = getBuildSecret(BuildSecret.API_URL)

export class ApiMocker {
    readonly username = 'trinovantes'

    #isLoggedIn = false

    setIsLoggedIn(isLoggedIn: boolean) {
        this.#isLoggedIn = isLoggedIn
    }

    async interceptApiRequests(page: Page) {
        await page.route(`${apiUrl}/api/settings/user`, async(route, request) => {
            if (!this.#isLoggedIn) {
                await route.fulfill({ status: 403 })
                return
            }

            if (request.method() !== 'GET') {
                await route.fallback()
                return
            }

            await route.fulfill({
                status: 200,
                json: {
                    id: 42,
                    lastChecked: null,
                    malUserId: 0xDEADBEEF,
                    malUsername: this.username,
                } satisfies UserResponse,
            })
        })

        await page.route(`${apiUrl}/api/settings/user`, async(route, request) => {
            if (!this.#isLoggedIn) {
                await route.fulfill({ status: 403 })
                return
            }

            if (request.method() !== 'DELETE') {
                await route.fallback()
                return
            }

            await route.fulfill({
                status: 200,
                json: {
                    message: 'Success',
                } satisfies SuccessResponse,
            })
        })

        await page.route(`${apiUrl}/api/oauth/login`, async(route) => {
            this.#isLoggedIn = true

            await route.fulfill({
                status: 200,
                json: {
                    // Bypass the oauth redirect cycle (api.myanimelist.net -> /api/oauth -> /settings) for e2e tests because playwright cannot intercept redirect requests
                    // i.e. if we mock api.myanimelist.net to redirect back to /api/oauth, we cannot mock /api/oauth
                    url: '/settings',
                } satisfies RedirectResponse,
            })
        })

        await page.route(`${apiUrl}/api/oauth/logout`, async(route) => {
            this.#isLoggedIn = false

            await route.fulfill({
                status: 200,
                json: {
                    message: 'Success',
                } satisfies SuccessResponse,
            })
        })
    }
}
