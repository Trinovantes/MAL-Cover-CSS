import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { DB_FILE } from '@/common/Constants'

if (DEFINE.IS_DEV) {
    sqlite3.verbose()
}

export const dbPromise = open({
    filename: DB_FILE,
    driver: sqlite3.Database,
})
