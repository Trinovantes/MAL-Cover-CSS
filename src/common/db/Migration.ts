import { desc, sql } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { DrizzleClient, DrizzleTransaction } from './createDb'

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
type Version = `${Digit}${Digit}${Digit}${Digit}`

export type Migration = {
    version: Version
    run: (db: DrizzleTransaction) => void
}

export const migrationTable = sqliteTable('schema_migrations', {
    version: text('version'),
})

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

export function createMigrationTable(db: DrizzleClient) {
    return db.run(sql`
        CREATE TABLE IF NOT EXISTS ${migrationTable}(
            version TEXT PRIMARY KEY
        ) STRICT
    `)
}

export function getCurrentMigrationVersion(db: DrizzleClient): string | null {
    const versionResult = db
        .select()
        .from(migrationTable)
        .orderBy(desc(migrationTable.version))
        .limit(1)
        .get()

    return versionResult?.version ?? null
}

export function insertMigration(db: DrizzleClient, version: Version) {
    return db
        .insert(migrationTable)
        .values({ version })
        .run()
}
