import { test } from 'vitest'
import { createDb, type DrizzleClient } from '../../../src/common/db/createDb.ts'
import { mockApi } from './mockApi.ts'
import { DB_MEMORY } from '../../../src/common/Constants.ts'
import { getMigrations } from '../../../src/common/db/getMigrations.ts'

type Fixtures = {
    db: DrizzleClient
    api: ReturnType<typeof mockApi>
}

export const apiTest = test.extend<Fixtures>({
    db: async ({}, use) => {
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

    api: async ({ db }, use) => {
        await use(mockApi(db))
    },
})
