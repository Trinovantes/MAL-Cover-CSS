import path from 'node:path'
import { glob } from 'node:fs/promises'
import type { Migration } from './migrateDb.ts'

export async function getMigrations(): Promise<Array<Migration>> {
    const migrations = new Array<Migration>()

    if (typeof import.meta.dirname === 'undefined') {
        const migrationFilesCtx = require.context('./migrations', true, /\d{4}[\w-]+\.ts$/) // Webpack specific function

        for (const migrationFileName of migrationFilesCtx.keys()) {
            const migrationFile = migrationFilesCtx(migrationFileName) as { default: Migration }
            migrations.push(migrationFile.default)
        }
    } else {
        for await (const filePath of glob('./migrations/*.ts', { cwd: import.meta.dirname })) {
            const fullPath = path.resolve(import.meta.dirname, filePath)
            const migration = await import(/* webpackIgnore: true */ fullPath) as { default: Migration }
            migrations.push(migration.default)
        }
    }

    return migrations.sort((migrationA, migrationB) => migrationA.version.localeCompare(migrationB.version))
}
