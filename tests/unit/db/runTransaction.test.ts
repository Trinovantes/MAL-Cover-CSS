import { DB_MEMORY } from '@/common/Constants'
import * as dbClientModule from '@/common/db/client'
import { runTransaction } from '@/common/db/runTransaction'

// ----------------------------------------------------------------------------
// Global
// ----------------------------------------------------------------------------

let testDbClient: dbClientModule.DbClient

beforeEach(() => {
    testDbClient = dbClientModule.createDbClient(DB_MEMORY)
    jest.spyOn(dbClientModule, 'getDbClient').mockImplementation(() => testDbClient)
})

afterEach(async() => {
    const db = await testDbClient
    await db.close()

    jest.restoreAllMocks()
})

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('runTransaction', () => {
    test('single transaction', async() => {
        const res = await runTransaction([
            'CREATE TABLE test_table_0000(id INTEGER PRIMARY KEY);',
        ])

        expect(res.length).toBe(1)

        const tables = await getDbTables()
        expect(tables.length).toBe(1)
    })

    test('multiple transactions in strings', async() => {
        const res = await runTransaction([
            'CREATE TABLE test_table_0000(id INTEGER PRIMARY KEY);',
            'CREATE TABLE test_table_0001(id INTEGER PRIMARY KEY);',
            'CREATE TABLE test_table_0002(id INTEGER PRIMARY KEY);',
        ])

        expect(res.length).toBe(3)

        const tables = await getDbTables()
        expect(tables.length).toBe(3)
    })

    test('multiple transactions in commands', async() => {
        const res = await runTransaction([
            {
                sql: 'CREATE TABLE test_table_0000(id INTEGER PRIMARY KEY);',
            },
            {
                sql: 'CREATE TABLE test_table_0001(id INTEGER PRIMARY KEY);',
            },
            {
                sql: 'CREATE TABLE test_table_0002(id INTEGER PRIMARY KEY);',
            },
        ])

        expect(res.length).toBe(3)

        const tables = await getDbTables()
        expect(tables.length).toBe(3)
    })

    test('multiple transactions in strings and commands', async() => {
        const res = await runTransaction([
            {
                sql: 'CREATE TABLE test_table_0000(id INTEGER PRIMARY KEY);',
            },
            'CREATE TABLE test_table_0001(id INTEGER PRIMARY KEY);',
            {
                sql: 'CREATE TABLE test_table_0002(id INTEGER PRIMARY KEY);',
            },
        ])

        expect(res.length).toBe(3)

        const tables = await getDbTables()
        expect(tables.length).toBe(3)
    })

    test('invalid transactions throws', async() => {
        const run = () => runTransaction([
            'CREATE TABLE test_table_0000(id INTEGER PRIMARY KEY);',
            'CREATE TABLE test_table_0000(id INTEGER PRIMARY KEY);',
        ])

        await expect(run()).rejects.toThrowError(/already exists/)

        const tables = await getDbTables()
        expect(tables.length).toBe(0)
    })

    test('only 1 of conflicting concurrent transaction runs', async() => {
        await new Promise<void>((resolve) => {
            let numFinished = 0

            runTransaction([
                'CREATE TABLE test_table_0000(id INTEGER PRIMARY KEY);',
                'CREATE TABLE test_table_0001(id INTEGER PRIMARY KEY);',
            ]).then(() => numFinished++).catch(() => numFinished++)

            runTransaction([
                'CREATE TABLE test_table_0000(id INTEGER PRIMARY KEY);',
                'CREATE TABLE test_table_0002(id INTEGER PRIMARY KEY);',
            ]).then(() => numFinished++).catch(() => numFinished++)

            const timeoutId = setInterval(() => {
                expect(numFinished).toBeLessThanOrEqual(2)

                if (numFinished === 2) {
                    clearInterval(timeoutId)
                    resolve()
                }
            }, 100)
        })

        const tables = await getDbTables()
        expect(tables.find((table) => table.name === 'test_table_0000')).not.toBeUndefined()
        expect(tables.find((table) => table.name === 'test_table_0001' || table.name === 'test_table_0002')).not.toBeUndefined()
        expect(tables.length).toBe(2)
    })
})

async function getDbTables() {
    const dbClient = await dbClientModule.getDbClient()
    const tables = await dbClient.all<Array<{ name: string }>>(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table';
    `)

    return tables
}
