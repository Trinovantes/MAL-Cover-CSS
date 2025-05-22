import { test } from 'vitest'
import { DrizzleClient, createDb } from '@/common/db/createDb'
import { DB_MEMORY } from '@/common/Constants'
import { mockApi } from './mockApi'
import { getMigrations } from '@/common/db/getMigrations'

type Fixtures = {
    db: DrizzleClient
    api: ReturnType<typeof mockApi>
}

export const apiTest = test.extend<Fixtures>({
    db: async({}, use) => {
        // Create db
        const db = await createDb(DB_MEMORY, {
            cleanOnExit: false,
            migrations: await getMigrations(),
        })

        // Wait for fixture to be used in test
        await use(db)

        // Clean up db
        db.$client.close()
    },

    api: async({ db }, use) => {
        await use(mockApi(db))
    },
})
