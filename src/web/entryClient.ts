// eslint-disable-next-line import/order
import './client/assets/css/main.scss'

// eslint-disable-next-line import/order
import '@/common/utils/setupDayjs'

import { Integrations } from '@sentry/tracing'
import * as Sentry from '@sentry/vue'
import { SENTRY_DSN } from '@/common/Constants'
import { createApp } from './app'

async function main() {
    const { app, router } = await createApp()

    Sentry.init({
        dsn: SENTRY_DSN,
        release: DEFINE.GIT_HASH,
        integrations: [
            new Integrations.BrowserTracing({
                routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            }),
        ],
        tracesSampleRate: 0,
        enabled: !DEFINE.IS_DEV,
    })

    app.mount('#app')
}

main().catch(console.warn)
