import { createDb } from '@/common/db/createDb'
import { DB_FILE } from '@/common/Constants'
import { migrateDb } from '@/common/db/migrateDb'
import { getMigrations } from '@/common/db/getMigrations'
import { Logger } from 'pino'

export async function initDb(logger?: Logger) {
    const { db } = createDb(DB_FILE, DEFINE.IS_DEV, logger)
    const migrations = getMigrations()
    await migrateDb(db, migrations, logger)
    return db
}
