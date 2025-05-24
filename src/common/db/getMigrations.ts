import path from 'node:path'
import { Migration } from './migrateDb'

export async function getMigrations(): Promise<Array<Migration>> {
    const isBun = (typeof Bun !== 'undefined')
    const migrations = new Array<Migration>()

    if (isBun) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { Glob } = await import('bun')
        const glob = new Glob('./src/common/db/migrations/*.ts')
        const filePaths = await Array.fromAsync(glob.scan('.'))

        for (const filePath of filePaths) {
            const fullPath = path.resolve(filePath)
            const migration = await import(/* webpackIgnore: true */ fullPath) as { default: Migration }
            migrations.push(migration.default)
        }
    } else {
        const migrationFilesCtx = require.context('./migrations', true, /\d{4}[\w-]+\.ts$/) // Webpack specific function (also emulated in vite with vite-plugin-require-context)

        for (const migrationFileName of migrationFilesCtx.keys()) {
            const migrationFile = migrationFilesCtx(migrationFileName) as { default: Migration }
            migrations.push(migrationFile.default)
        }
    }

    return migrations.sort((migrationA, migrationB) => migrationA.version.localeCompare(migrationB.version))
}
