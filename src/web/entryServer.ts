// eslint-disable-next-line import/order
import '@/common/utils/setupDayjs'

import http from 'http'
import { migrateDb } from '@/common/db/migration'
import { getRuntimeSecret, RuntimeSecret } from '@/common/utils/RuntimeSecret'
import { createServerApp } from './server/createServerApp'
import { setupTestInterceptors } from './server/setupTestInterceptors'

async function main() {
    await migrateDb()

    const isDev = DEFINE.IS_DEV
    const isProd = !DEFINE.IS_DEV
    const isTest = getRuntimeSecret(RuntimeSecret.IS_TEST, 'false') === 'true'

    if (isTest) {
        setupTestInterceptors()
    }

    const app = await createServerApp({
        trustProxy: isProd,
        useMemoryStorage: isTest,
        enableStaticFiles: isDev,
        enableSentry: isProd,
        enableLogging: getRuntimeSecret(RuntimeSecret.ENABLE_LOGGING) === 'true',
        enableSessions: getRuntimeSecret(RuntimeSecret.ENABLE_SESSIONS) === 'true',
    })

    const port = parseInt(DEFINE.APP_PORT ?? '3000')
    const server = http.createServer(app)

    console.info('Starting HTTP Server')
    server.listen(port, '0.0.0.0', (): void => {
        console.info('Server Ready', server.address())
    })

    server.on('error', (error) => {
        console.warn('Server Error', error)
    })
}

main().catch(console.error)
