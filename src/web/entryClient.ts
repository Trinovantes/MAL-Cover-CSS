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
            release: DEFINE.GIT_HASH,
            dsn: SENTRY_DSN,
            integrations: [
                Sentry.browserTracingIntegration({ router }),
            ],
            tracesSampleRate: 0,
            profilesSampleRate: 0,
        })
    }

    app.mount('#app')
}

main().catch((err: unknown) => {
    console.error(err)
})
