import { open } from 'sqlite'
import sqlite3 from 'sqlite3'

// ----------------------------------------------------------------------------
// Client Helpers
// ----------------------------------------------------------------------------

if (DEFINE.IS_DEV) {
    sqlite3.verbose()
}

export type DbClient = ReturnType<typeof open>

export async function createDbClient(filePath: string): DbClient {
    return open({
        filename: filePath,
        driver: sqlite3.Database,
    })
}
