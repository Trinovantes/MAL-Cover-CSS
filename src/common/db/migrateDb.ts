import { Logger } from 'pino'
import { MAX_MIGRATION_ATTEMPTS } from '../Constants'
import { sleep } from '../utils/sleep'
import { createMigrationTable, insertMigration, getCurrentMigrationVersion, Migration } from './Migration'
import { DrizzleClient } from '@/common/db/createDb'

export async function migrateDb(db: DrizzleClient, migrations: Array<Migration>, logger?: Logger) {
    for (let attempt = 1; attempt <= MAX_MIGRATION_ATTEMPTS; attempt++) {
        try {
            migrate(db, migrations, attempt, logger)
            return
        } catch (err) {
            if (attempt === MAX_MIGRATION_ATTEMPTS) {
                logger?.fatal('Failed to migrate db')
                logger?.fatal(err)
                process.exit(1)
            }

            const duration = Math.round(Math.floor(Math.random() * 1000) + (Math.exp(attempt) * 1000))
            logger?.warn(`Failed migration, going to sleep for ${duration}ms`)
            logger?.warn(err)
            await sleep(duration)
        }
    }
}

function migrate(db: DrizzleClient, migrations: Array<Migration>, attempt: number, logger?: Logger) {
    db.transaction((tx) => {
        createMigrationTable(tx)

        const currentVersion = getCurrentMigrationVersion(db)
        const migrationsToRun = currentVersion
            ? migrations.filter((migration) => migration.version > currentVersion)
            : migrations

        logger?.info(`migrateDb() attempt:${attempt} currentVersion:${currentVersion} migrationsToRun:${migrationsToRun.length}`)
        for (const migration of migrationsToRun) {
            logger?.info('Starting Migration', migration.version)

            migration.run(tx)
            insertMigration(db, migration.version)

            logger?.info(`Completed Migration ${migration.version}`)
        }
    })
}
