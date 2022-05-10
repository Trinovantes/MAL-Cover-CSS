// eslint-disable-next-line import/order
import '@/common/utils/setupDayjs'

import http from 'http'
import { migrateDb } from '@/common/db/migration'
import { getSecret, RuntimeSecret } from '@/common/utils/RuntimeSecret'
import { createServerApp } from './server/createServerApp'

async function main() {
    await migrateDb()

    const app = await createServerApp({
        trustProxy: !DEFINE.IS_DEV,
        enableStaticFiles: DEFINE.IS_DEV,
        enableLogging: getSecret(RuntimeSecret.ENABLE_LOGGING) === 'true',
        enableSentry: !DEFINE.IS_DEV,
        enableSessions: getSecret(RuntimeSecret.ENABLE_SESSIONS) === 'true',
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
