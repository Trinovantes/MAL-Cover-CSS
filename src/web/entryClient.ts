// eslint-disable-next-line import/order
import './client/assets/css/main.scss'

// eslint-disable-next-line import/order
import '@/common/utils/setupDayjs'

import { Integrations } from '@sentry/tracing'
import * as Sentry from '@sentry/vue'
import { SENTRY_DSN } from '@/common/Constants'
import { createVueApp } from './createVueApp'

async function main() {
    const { app, router } = await createVueApp()

    if (!DEFINE.IS_DEV) {
        Sentry.init({
            app,
            release: DEFINE.GIT_HASH,
            dsn: SENTRY_DSN,
            integrations: [
                new Integrations.BrowserTracing({
                    routingInstrumentation: Sentry.vueRouterInstrumentation(router),
                }),
            ],
            tracesSampleRate: 0,
            enabled: !DEFINE.IS_DEV,
        })
    }

    app.mount('#app')
}

window.addEventListener('error', console.warn)
window.addEventListener('unhandledrejection', console.warn)
void main()
