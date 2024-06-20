// This file will be renamed to main.js after being compiled by webpack
// It is kept as entryClient for historical value to match Vue's SSR guides

import './client/assets/css/main.scss'
import * as Sentry from '@sentry/vue'
import { SENTRY_DSN } from '@/common/Constants'
import { createVueApp } from './createVueApp'

async function main() {
    console.info('Release', DEFINE.GIT_HASH)
    const { app, router } = await createVueApp()

    if (!DEFINE.IS_DEV) {
        Sentry.init({
            app,
            dsn: SENTRY_DSN,
            release: DEFINE.GIT_HASH,
            tracesSampleRate: 0.1,
            profilesSampleRate: 0.1,
            integrations: [
                new Sentry.BrowserTracing({
                    routingInstrumentation: Sentry.vueRouterInstrumentation(router),
                }),
            ],
        })
    }

    app.mount('#app')
}

main().catch((err: unknown) => {
    console.error(err)
})
