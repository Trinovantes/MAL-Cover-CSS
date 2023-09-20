import { test } from 'vitest'
import { DrizzleClient, createDb } from '@/common/db/createDb'
import { DB_MEMORY } from '@/common/Constants'
import { migrateDb } from '@/common/db/migrateDb'
import { getMigrations } from '@/common/db/getMigrations'
import { mockApi } from './mockApi'

type Fixtures = {
    db: DrizzleClient
    api: ReturnType<typeof mockApi>
}

export const apiTest = test.extend<Fixtures>({
    db: async({}, use) => {
        // Create db
        const { db, client } = createDb(DB_MEMORY, false)

        // Run migrations
        const migrations = getMigrations()
        await migrateDb(db, migrations)

        // Wait for fixture to be used in test
        await use(db)

        // Clean up db
        client.close()
    },

    api: async({ db }, use) => {
        await use(mockApi(db))
    },
})
