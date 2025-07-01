// This file will be renamed to www.js after being compiled by webpack
// It is kept as entryServer for historical value to match Vue's SSR guides

import http from 'node:http'
import { pinoHttp } from 'pino-http'
import { createLogger } from '../common/node/createLogger.ts'
import { DB_FILE } from '../common/Constants.ts'
import { createDb } from '../common/db/createDb.ts'
import { getMigrations } from '../common/db/getMigrations.ts'
import { createServerApp } from './server/createServerApp.ts'
import { createSessionStore } from './server/utils/createSessionStore.ts'

const logger = createLogger()

async function main() {
    const migrations = await getMigrations()
    const db = await createDb(DB_FILE, {
        cleanOnExit: true,
        migrations,
    })

    const app = createServerApp({
        trustProxy: !__IS_DEV__,
        enableCors: __IS_DEV__,
        enableStaticFiles: __IS_DEV__,
        enableVue: true,

        db,
        sessionStore: await createSessionStore(),
        httpLogger: pinoHttp({ logger }),
    })

    const port = parseInt(__API_PORT__)
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
