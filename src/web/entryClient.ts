import './assets/css/main.scss'
import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'
import { SENTRY_DSN } from '@/common/Constants'
import '@/common/utils/setupDayjs'
import { createApp } from './app'

Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
        new Integrations.BrowserTracing(),
    ],
    tracesSampleRate: 1.0,
    enabled: !DEFINE.IS_DEV,
})

async function main() {
    const { app } = await createApp()
    app.mount('#app')
}

main().catch((err) => {
    console.warn(err)
    Sentry.captureException(err)
})
