import { getDbClient } from './client'

export interface Command {
    sql: string
    params?: Record<string, string>
}

export type CommandResults = Array<Array<unknown>> | undefined

/**
 * Each command must be 1 statement i.e. only 1 semicolon per string
 */
export async function runTransaction(commands: Array<Command | string>): Promise<Array<CommandResults>> {
    const dbClient = await getDbClient()
    const db = dbClient.getDatabaseInstance()

    const runStatement = (command: Command | string) => new Promise<CommandResults>((resolve, reject) => {
        const sql = typeof command === 'string'
            ? command
            : command.sql
        const params = typeof command === 'string'
            ? {}
            : command.params ?? {}

        db.all(sql, params, function(this, err, rows) {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })

    try {
        await runStatement('BEGIN;')
    } catch (err) {
        console.warn('Transaction Error')
        console.warn(err)

        throw err
    }

    try {
        const results = []

        for (const command of commands) {
            const result = await runStatement(command)
            results.push(result)
        }

        await runStatement('COMMIT;')
        return results
    } catch (err) {
        console.warn('Transaction Error')
        console.warn(err)

        await runStatement('ROLLBACK;')
        throw err
    }
}
