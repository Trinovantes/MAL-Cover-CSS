import { DB_FILE } from '@/common/Constants'
import { createDbClient, DbClient } from './connection'

let globalDbClient: DbClient | null

export function getDbClient(): DbClient {
    if (!globalDbClient) {
        globalDbClient = createDbClient(DB_FILE)
    }

    return globalDbClient
}
