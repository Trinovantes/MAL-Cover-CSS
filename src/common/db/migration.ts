import { readdirSync, readFileSync, statSync } from 'fs'
import path from 'path'
import { DB_MIGRATIONS_DIR } from '@/common/Constants'
import { getDbClient } from './client'

export const MIGRATE_UP_MARKER = '-- migrate:up'
export const MIGRATE_DOWN_MARKER = '-- migrate:down'
export const MIGRATION_TABLE_NAME = 'schema_version'

export interface MigrationTableAttrs {
    version: string
}

export interface Migration {
    version: string
    upSql: string
    downSql: string
}

// ----------------------------------------------------------------------------
// Migration
// ----------------------------------------------------------------------------

export async function migrateDb(migrateUp = true, migrationsDir = DB_MIGRATIONS_DIR): Promise<void> {
    const migrations = getMigrations(migrationsDir)

    await createMigrationTableIfNotExists()

    if (migrateUp) {
        await migrateDbUp(migrations)
    } else {
        await migrateDbDown(migrations)
    }
}

export async function migrateDbUp(migrations: Array<Migration>): Promise<void> {
    const dbClient = await getDbClient()

    try {
        await dbClient.exec('BEGIN;')

        const currentVersion = await getCurrentSchemaVersion()
        const migrationsToRun = currentVersion
            ? migrations.filter((migration) => migration.version > currentVersion)
            : migrations

        for (const migration of migrationsToRun) {
            console.info('Migrating Up', migration.version)

            await dbClient.exec(migration.upSql)
            await dbClient.exec(`
                INSERT INTO ${MIGRATION_TABLE_NAME}(version)
                VALUES ('${migration.version}');
            `)
        }

        await dbClient.exec('COMMIT;')
    } catch (err) {
        console.warn('Transaction Error')
        console.warn(err)
        await dbClient.exec('ROLLBACK;')
        throw err
    }
}

export async function migrateDbDown(migrations: Array<Migration>): Promise<void> {
    const dbClient = await getDbClient()

    try {
        await dbClient.exec('BEGIN;')

        const currentVersion = await getCurrentSchemaVersion()
        const migrationsToRun = currentVersion
            ? migrations.filter((migration) => migration.version <= currentVersion)
            : []

        for (const migration of migrationsToRun) {
            console.info('Migrating Down', migration.version)
            await dbClient.exec(migration.downSql)
            await dbClient.exec(`
                DELETE FROM ${MIGRATION_TABLE_NAME}
                WHERE version = '${migration.version}';
            `)
        }

        await dbClient.exec('COMMIT;')
    } catch (err) {
        console.warn('Transaction Error')
        console.warn(err)
        await dbClient.exec('ROLLBACK;')
        throw err
    }
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

export async function getCurrentSchemaVersion(): Promise<string | undefined> {
    const dbClient = await getDbClient()

    const result = await dbClient.get<MigrationTableAttrs>(`
        SELECT *
        FROM ${MIGRATION_TABLE_NAME}
        ORDER BY version DESC
        LIMIT 1;
    `)

    return result?.version
}

export async function createMigrationTableIfNotExists(): Promise<void> {
    const dbClient = await getDbClient()

    await dbClient.run(`
        CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE_NAME}(
            version TEXT PRIMARY KEY
        );
    `)
}

export function getMigrations(migrationsDir: string): Array<Migration> {
    const dir = readdirSync(migrationsDir)
    const migrations: Array<Migration> = []

    for (const item of dir) {
        if (!item.endsWith('.sql')) {
            continue
        }

        const fullPath = path.resolve(migrationsDir, item)
        if (!statSync(fullPath).isFile()) {
            continue
        }

        const version = item.split('_')[0]
        const fileBuffer = readFileSync(fullPath)
        const fileContents = fileBuffer.toString()

        const upIdx = fileContents.indexOf(MIGRATE_UP_MARKER)
        const downIdx = fileContents.indexOf(MIGRATE_DOWN_MARKER)
        if (upIdx < 0 || downIdx < 0 || upIdx > downIdx) {
            throw new Error(`Invalid SQL file "${fullPath}" upIdx:${upIdx} downIdx:${downIdx}`)
        }

        const upSql = fileContents.substring(upIdx, downIdx)
        const downSql = fileContents.substring(downIdx)

        migrations.push({
            version,
            upSql,
            downSql,
        })
    }

    return migrations.sort((migrationA, migrationB) => migrationA.version.localeCompare(migrationB.version))
}
