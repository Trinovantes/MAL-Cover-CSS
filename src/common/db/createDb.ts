import { userTable } from './models/User'
import { itemTable } from './models/Item'
import { Logger } from 'drizzle-orm'
import { Migration, migrateDb } from './migrateDb'

export type DbLogger = Pick<Console, 'error' | 'warn' | 'info' | 'debug'>
export type DbHandles = Awaited<ReturnType<typeof createDb>>

// Still need to use both Bun runtime and Node (better-sqlite3) runtimes because:
// - Bun cannot run node-compiled better-sqlite3 (thus cannot use better-sqlite3 for both cases)
// - Bun cannot compile Vue files (thus cannot test/run the SSR server)
// - Bun does not support vitest (thus any tests that need to access db cannot be run inside Bun)
//
// Due to some minor differences in the database drivers, the drizzle client types are not equivalent
// Do not use type union (Bun | Bs3) because it narrows the type too much (e.g. cannot specify fields in select)
// As a result, we just assume we are always using the BetterSqlite3 interface and hopefully do not hit an edge case where a feature is only available in BetterSqlite3 but not Bun
export type DrizzleClient = Awaited<ReturnType<typeof createBs3Db>>

type Opts = Partial<{
    logger: DbLogger
    cleanOnExit: boolean
    migrations: Array<Migration>
}>

export async function createDb(filePath: string, opts?: Opts): Promise<DrizzleClient> {
    const isBun = (typeof Bun !== 'undefined')
    const logger = opts?.logger
    const drizzleLogger = createDrizzleLogger(opts?.logger)

    logger?.info(`createDb() filePath:"${filePath}" isBun:${isBun}`)
    const db = isBun
        ? await createBunDb(filePath, drizzleLogger)
        : await createBs3Db(filePath, drizzleLogger)

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

async function createBunDb(filePath: string, drizzleLogger?: Logger) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { Database } = await import(/* webpackIgnore: true */ 'bun:sqlite')
    const { drizzle } = await import(/* webpackIgnore: true */ 'drizzle-orm/bun-sqlite')

    const client = new Database(filePath)
    const db = drizzle(client, {
        schema: {
            userTable,
            itemTable,
        },
        logger: drizzleLogger,
    })

    return db as unknown as DrizzleClient
}

async function createBs3Db(filePath: string, drizzleLogger?: Logger) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { default: Database } = await import('better-sqlite3')
    const { drizzle } = await import('drizzle-orm/better-sqlite3')

    const client = new Database(filePath)
    const db = drizzle(client, {
        schema: {
            userTable,
            itemTable,
        },
        logger: drizzleLogger,
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
