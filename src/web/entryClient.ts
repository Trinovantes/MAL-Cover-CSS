// This file will be renamed to main.js after being compiled by webpack
// It is kept as entryClient for historical value to match Vue's SSR guides

import './client/assets/css/main.scss'
import * as Sentry from '@sentry/vue'
import { createHead } from '@unhead/vue/client'
import { createVueApp } from './createVueApp.ts'
import { SENTRY_DSN } from '../common/Constants.ts'

async function main() {
    console.info('Release', __GIT_HASH__)
    const head = createHead()
    const { app, router } = await createVueApp(head)

    if (!__IS_DEV__) {
        Sentry.init({
            app,
            release: __GIT_HASH__,
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
