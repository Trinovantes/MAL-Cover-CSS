import { Migration } from './Migration'

export function getMigrations(): Array<Migration> {
    const migrationFilesCtx = require.context('@/common/db/migrations', true, /\d{4}[\w-]+\.ts$/) // Webpack specific function
    const migrations = new Array<Migration>()

    for (const migrationFileName of migrationFilesCtx.keys()) {
        const migrationFile = migrationFilesCtx(migrationFileName) as { default: Migration }
        migrations.push(migrationFile.default)
    }

    return migrations.sort((migrationA, migrationB) => migrationA.version.localeCompare(migrationB.version))
}
