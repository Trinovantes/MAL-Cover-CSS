import type { Logger } from 'drizzle-orm'
import { type Migration, migrateDb } from './migrateDb.ts'
import { userTable } from './models/User.ts'
import { itemTable } from './models/Item.ts'

export type DbLogger = Pick<Console, 'error' | 'warn' | 'info' | 'debug'>
export type DbHandles = Awaited<ReturnType<typeof createDb>>
export type DrizzleClient = Awaited<ReturnType<typeof createBs3Db>>

type Opts = Partial<{
    logger: DbLogger
    cleanOnExit: boolean
    migrations: Array<Migration>
}>

export async function createDb(filePath: string, opts?: Opts): Promise<DrizzleClient> {
    const logger = opts?.logger
    logger?.info(`createDb() filePath:"${filePath}"`)

    const db = await createBs3Db(filePath, logger)
    db.run('PRAGMA foreign_keys = ON')
    db.run('PRAGMA journal_mode = WAL')
    db.run('PRAGMA analysis_limit = 1000')

    if (opts?.cleanOnExit) {
        process.on('exit', () => {
            db.run('PRAGMA optimize')
            db.$client.close()
        })
        process.on('SIGHUP', () => process.exit(128 + 1))
        process.on('SIGINT', () => process.exit(128 + 2))
        process.on('SIGTERM', () => process.exit(128 + 15))
    }

    if (opts?.migrations) {
        await migrateDb(db, opts.migrations, { logger })
    }

    return db
}

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

async function createBs3Db(filePath: string, logger?: DbLogger) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { default: Database } = await import('better-sqlite3')
    const { drizzle } = await import('drizzle-orm/better-sqlite3')

    const client = new Database(filePath)
    const db = drizzle(client, {
        schema: {
            userTable,
            itemTable,
        },
        logger: createDrizzleLogger(logger),
    })

    return db
}

function createDrizzleLogger(logger?: DbLogger): Logger | undefined {
    if (!logger) {
        return undefined
    }

    return {
        logQuery(query, params) {
            query = query.replace(/^\n+/g, '\n')
            query = query.replace(/^\n/, '')
            query = query.trimEnd()
            logger.debug(query)

            if (params.length > 0) {
                logger.debug(params)
            }
        },
    }
}
