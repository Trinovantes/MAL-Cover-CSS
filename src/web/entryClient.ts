import './assets/css/main.scss'
import { Integrations } from '@sentry/tracing'
import * as Sentry from '@sentry/vue'
import { SENTRY_DSN } from '@/common/Constants'
import '@/common/utils/setupDayjs'
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
