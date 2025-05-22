import { desc, sql } from 'drizzle-orm'
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { DbLogger, DrizzleClient } from './createDb'
import { MAX_MIGRATION_ATTEMPTS, RETRY_MIGRATION_AFTER_MS } from '../Constants'
import { sleep } from '../utils/sleep'

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
type Version = `${Digit}${Digit}${Digit}${Digit}`

export type Migration = {
    version: Version
    run: (db: DrizzleClient) => void | Promise<void>
}

export const migrationTable = sqliteTable('schema_migrations', {
    version: text('version'),
})

// ----------------------------------------------------------------------------
// MARK: SQL Helpers
// ----------------------------------------------------------------------------

function createMigrationTable(db: DrizzleClient): void {
    db.run(sql`
        CREATE TABLE IF NOT EXISTS ${migrationTable} (
            version TEXT PRIMARY KEY
        ) STRICT;
    `)
}

function insertMigration(db: DrizzleClient, version: Version): void {
    db
        .insert(migrationTable)
        .values({ version })
        .run()
}

export function getCurrentMigrationVersion(db: DrizzleClient): string | null {
    return db
        .select()
        .from(migrationTable)
        .orderBy(desc(migrationTable.version))
        .limit(1)
        .get()?.version ?? null
}

// ----------------------------------------------------------------------------
// MARK: migrate
// ----------------------------------------------------------------------------

type Opts = Partial<{
    maxAttempts: number
    logger: DbLogger
}>

export async function migrateDb(db: DrizzleClient, migrations: Array<Migration>, opts?: Opts): Promise<boolean> {
    const maxAttempts = opts?.maxAttempts ?? MAX_MIGRATION_ATTEMPTS
    const logger = opts?.logger

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const progress = `attempt:${attempt}/${maxAttempts}`

        try {
            db.run(sql`BEGIN TRANSACTION`)
        } catch (err) {
            logger?.info(`[${progress}] Failed to start transaction`)
            logger?.info(err)
            await sleepRandom(attempt)
            continue
        }

        try {
            createMigrationTable(db)

            const currentVersion = getCurrentMigrationVersion(db)
            const migrationsToRun = currentVersion
                ? migrations.filter((migration) => migration.version > currentVersion)
                : migrations

            logger?.info(`[${progress}] Running migrations currentVersion:${currentVersion} migrationsToRun:${migrationsToRun.length}`)
            for (const migration of migrationsToRun) {
                logger?.info(`Starting Migration ${migration.version}`)
                await migration.run(db)
                insertMigration(db, migration.version)
                logger?.info(`Completed Migration ${migration.version}`)
            }

            db.run(sql`COMMIT`)
            return true
        } catch (err) {
            logger?.info(`[${progress}] Failed migration`)
            logger?.info(err)
            db.run(sql`ROLLBACK`)

            if (attempt === maxAttempts) {
                process.exit(1)
            }

            await sleepRandom(attempt)
        }
    }

    return false
}

async function sleepRandom(attempt: number): Promise<void> {
    const backoff = Math.exp(attempt) * RETRY_MIGRATION_AFTER_MS
    const noise = Math.floor(Math.random() * RETRY_MIGRATION_AFTER_MS * 2) - RETRY_MIGRATION_AFTER_MS
    const duration = Math.round(backoff + noise)
    await sleep(duration)
}
