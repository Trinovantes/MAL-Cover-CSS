import BetterSqlite3 from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { Logger } from 'pino'
import { userTable } from './models/User'
import { itemTable } from './models/Item'

export type DrizzleClient = ReturnType<typeof createDb>['db']
export type DrizzleTransaction = Parameters<Parameters<DrizzleClient['transaction']>[0]>[0]

export function createDb(filePath: string, cleanOnExit: boolean, logger?: Logger) {
    const logDb = (message: unknown, ...additionalArgs: Array<unknown>) => {
        if (typeof message === 'string') {
            message = message.replace(/^\n+/g, '\n').trimEnd()
        }

        logger?.trace(message)

        if (additionalArgs.length > 0) {
            logger?.trace(additionalArgs)
        }
    }

    const client = new BetterSqlite3(filePath, {
        verbose: logger
            ? logDb
            : undefined,
    })

    client.pragma('foreign_keys = ON')
    client.pragma('journal_mode = WAL')
    client.pragma('analysis_limit = 1000')

    // Catch CTRL+C events and close client properly
    if (cleanOnExit) {
        process.on('exit', () => {
            client.pragma('optimize')
            client.close()
        })
        process.on('SIGHUP', () => process.exit(128 + 1))
        process.on('SIGINT', () => process.exit(128 + 2))
        process.on('SIGTERM', () => process.exit(128 + 15))
    }

    const db = drizzle(client, {
        schema: {
            userTable,
            itemTable,
        },
    })

    return {
        db,
        client,
    }
}
