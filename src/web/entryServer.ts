// This file will be renamed to www.js after being compiled by webpack
// It is kept as entryServer for historical value to match Vue's SSR guides

import http from 'node:http'
import { createServerApp } from './server/createServerApp'
import { initDb } from '@/common/db/initDb'
import { createSessionStore } from './server/utils/createSessionStore'
import { pinoHttp } from 'pino-http'
import { createLogger } from '@/common/node/createLogger'

const logger = createLogger()

async function main() {
    const app = createServerApp({
        trustProxy: !DEFINE.IS_DEV,
        enableCors: DEFINE.IS_DEV,
        enableStaticFiles: DEFINE.IS_DEV,
        enableVue: true,

        db: await initDb(logger),
        sessionStore: await createSessionStore(),
        httpLogger: pinoHttp({ logger }),
    })

    const port = parseInt(DEFINE.API_PORT)
    const server = http.createServer(app)

    server.listen(port, '0.0.0.0', (): void => {
        logger.info('Server Ready')
        logger.info(server.address())
    })
}

main().catch((err: unknown) => {
    logger.error(err)
    process.exit(1)
})
