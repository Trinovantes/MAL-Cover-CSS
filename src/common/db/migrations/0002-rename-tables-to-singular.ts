import { sql } from 'drizzle-orm'
import type { Migration } from '../migrateDb.ts'

const migration: Migration = {
    version: '0002' as const,

    run: (transaction) => {
        transaction.run(sql`ALTER TABLE 'Users' RENAME TO 'User'`)
        transaction.run(sql`ALTER TABLE 'Items' RENAME TO 'Item'`)
    },
}

export default migration
