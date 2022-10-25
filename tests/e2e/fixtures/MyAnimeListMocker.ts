import assert from 'assert'
import { match } from 'path-to-regexp'
import type { Page, Route, Request } from '@playwright/test'

type ApiHandler = {
    route: string
    onMatch: (opts: { route: Route; request: Request; url: URL; params: Record<string, string> }) => void
}

export class MyAnimeListMocker {
    readonly #handlers = new Array<ApiHandler>()

    constructor() {
        this.#handle('/v1/oauth2/authorize', ({ route, url }) => {
            const oauthRedirect = url.searchParams.get('redirect_uri')
            assert(oauthRedirect)

            const oauthState = url.searchParams.get('state')
            assert(oauthState)

            const redirectUrl = new URL(oauthRedirect)
            redirectUrl.searchParams.append('state', decodeURIComponent(oauthState))
            redirectUrl.searchParams.append('code', 'TEST_AUTH_CODE')

            void route.fulfill({
                status: 301,
                headers: {
                    Location: redirectUrl.toString(),
                },
            })
        })
    }

    #handle(route: string, onMatch: ApiHandler['onMatch']) {
        this.#handlers.push({ route, onMatch })
    }

    async interceptApiRequests(page: Page) {
        const matchFns = this.#handlers.map((handler) => match(handler.route))
        const onRoute: Parameters<Page['route']>[1] = (route, request) => {
            const url = new URL(request.url())
            if (!url.pathname) {
                throw new Error(`Invalid url.pathname "${url.pathname}" for url "${url.href}"`)
            }

            for (let i = 0; i < matchFns.length; i++) {
                const matches = matchFns[i](url.pathname)

                if (matches !== false) {
                    return this.#handlers[i].onMatch({
                        route,
                        request,
                        url,
                        params: matches.params as Record<string, string>,
                    })
                }
            }

            throw new Error(`Unhandled Playwright Route: "${url.pathname}"`)
        }

        await page.route('https://myanimelist.net/**', onRoute)
        await page.route('https://api.myanimelist.net/**', onRoute)
    }
}
