import assert from 'assert'
import fs from 'fs'
import path from 'path'
import * as dbClientModule from '@/common/db/client'
import { createMigrationTableIfNotExists, getCurrentSchemaVersion, getMigrations, migrateDbDown, migrateDbUp, MIGRATE_DOWN_MARKER, MIGRATE_UP_MARKER, MIGRATION_TABLE_NAME } from '@/common/db/migration'

// ----------------------------------------------------------------------------
// Global
// ----------------------------------------------------------------------------

let testDbClient: dbClientModule.DbClient

beforeEach(() => {
    testDbClient = dbClientModule.createDbClient(':memory:')
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

describe('migration', () => {
    test('smoke', () => {
        expect(true).toBe(true)
    })

    describe('migrateDbUp', () => {
        test('when database is empty', async() => {
            const dbClient = await dbClientModule.getDbClient()
            await createMigrationTableIfNotExists()
            const getTestTable = () => dbClient.get('SELECT * FROM test_table;')

            await expect(getTestTable()).rejects.toThrow()

            await migrateDbUp([
                {
                    version: '0001',
                    upSql: 'CREATE TABLE test_table(id INTEGER PRIMARY KEY);',
                    downSql: 'DROP TABLE test_table;',
                },
            ])

            await expect(getTestTable()).resolves.toBeUndefined()
        })

        test('when database has 1/2 migration', async() => {
            const dbClient = await dbClientModule.getDbClient()
            await createMigrationTableIfNotExists()
            const getTestTable = (id: number) => dbClient.get(`SELECT * FROM test_table${id};`)

            await dbClient.run('CREATE TABLE test_table1(id INTEGER PRIMARY KEY);')
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0001');`)

            await expect(getTestTable(1)).resolves.toBeUndefined()
            await expect(getTestTable(2)).rejects.toThrow()

            await migrateDbUp([
                {
                    version: '0001',
                    upSql: 'CREATE TABLE test_table1(id INTEGER PRIMARY KEY);',
                    downSql: 'DROP TABLE test_table1;',
                },
                {
                    version: '0002',
                    upSql: 'CREATE TABLE test_table2(id INTEGER PRIMARY KEY);',
                    downSql: 'DROP TABLE test_table2;',
                },
            ])

            await expect(getTestTable(1)).resolves.toBeUndefined()
            await expect(getTestTable(2)).resolves.toBeUndefined()
        })

        test('when database has 2/2 migrations', async() => {
            const dbClient = await dbClientModule.getDbClient()
            await createMigrationTableIfNotExists()
            const getTestTable = (id: number) => dbClient.get(`SELECT * FROM test_table${id};`)

            await dbClient.run('CREATE TABLE test_table1(id INTEGER PRIMARY KEY);')
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0001');`)
            await dbClient.run('CREATE TABLE test_table2(id INTEGER PRIMARY KEY);')
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0002');`)

            await expect(getTestTable(1)).resolves.toBeUndefined()
            await expect(getTestTable(2)).resolves.toBeUndefined()

            await migrateDbUp([
                {
                    version: '0001',
                    upSql: 'CREATE TABLE test_table1(id INTEGER PRIMARY KEY);',
                    downSql: 'DROP TABLE test_table1;',
                },
                {
                    version: '0002',
                    upSql: 'CREATE TABLE test_table2(id INTEGER PRIMARY KEY);',
                    downSql: 'DROP TABLE test_table2;',
                },
            ])

            await expect(getTestTable(1)).resolves.toBeUndefined()
            await expect(getTestTable(2)).resolves.toBeUndefined()
        })
    })

    describe('migrateDbDown', () => {
        test('when database is empty', async() => {
            const dbClient = await dbClientModule.getDbClient()
            await createMigrationTableIfNotExists()
            const getTestTable = () => dbClient.get('SELECT * FROM test_table;')

            await expect(getTestTable()).rejects.toThrow()

            await migrateDbDown([
                {
                    version: '0001',
                    upSql: 'CREATE TABLE test_table(id INTEGER PRIMARY KEY);',
                    downSql: 'DROP TABLE test_table;',
                },
            ])

            await expect(getTestTable()).rejects.toThrow()
        })

        test('when database has 1/2 migration', async() => {
            const dbClient = await dbClientModule.getDbClient()
            await createMigrationTableIfNotExists()
            const getTestTable = (id: number) => dbClient.get(`SELECT * FROM test_table${id};`)

            await dbClient.run('CREATE TABLE test_table1(id INTEGER PRIMARY KEY);')
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0001');`)

            await expect(getTestTable(1)).resolves.toBeUndefined()
            await expect(getTestTable(2)).rejects.toThrow()

            await migrateDbDown([
                {
                    version: '0001',
                    upSql: 'CREATE TABLE test_table1(id INTEGER PRIMARY KEY);',
                    downSql: 'DROP TABLE test_table1;',
                },
                {
                    version: '0002',
                    upSql: 'CREATE TABLE test_table2(id INTEGER PRIMARY KEY);',
                    downSql: 'DROP TABLE test_table2;',
                },
            ])

            await expect(getTestTable(1)).rejects.toThrow()
            await expect(getTestTable(2)).rejects.toThrow()
        })

        test('when database has 2/2 migrations', async() => {
            const dbClient = await dbClientModule.getDbClient()
            await createMigrationTableIfNotExists()
            const getTestTable = (id: number) => dbClient.get(`SELECT * FROM test_table${id};`)

            await dbClient.run('CREATE TABLE test_table1(id INTEGER PRIMARY KEY);')
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0001');`)
            await dbClient.run('CREATE TABLE test_table2(id INTEGER PRIMARY KEY);')
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0002');`)

            await expect(getTestTable(1)).resolves.toBeUndefined()
            await expect(getTestTable(2)).resolves.toBeUndefined()

            await migrateDbDown([
                {
                    version: '0001',
                    upSql: 'CREATE TABLE test_table1(id INTEGER PRIMARY KEY);',
                    downSql: 'DROP TABLE test_table1;',
                },
                {
                    version: '0002',
                    upSql: 'CREATE TABLE test_table2(id INTEGER PRIMARY KEY);',
                    downSql: 'DROP TABLE test_table2;',
                },
            ])

            await expect(getTestTable(1)).rejects.toThrow()
            await expect(getTestTable(2)).rejects.toThrow()
        })
    })

    describe('getCurrentSchemaVersion', () => {
        test('when database is empty', async() => {
            const version = await getCurrentSchemaVersion()
            expect(version).toBeUndefined()
        })

        test('when database has 1 migration', async() => {
            const dbClient = await dbClientModule.getDbClient()
            await createMigrationTableIfNotExists()
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0001');`)

            const version = await getCurrentSchemaVersion()
            expect(typeof version).toBe('string')
            expect(version).toBe('0001')
        })

        test('when database has 2 migrations', async() => {
            const dbClient = await dbClientModule.getDbClient()
            await createMigrationTableIfNotExists()
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0001');`)
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0002');`)

            const version = await getCurrentSchemaVersion()
            expect(typeof version).toBe('string')
            expect(version).toBe('0002')
        })

        test('when database has 2 migrations in reverse order', async() => {
            const dbClient = await dbClientModule.getDbClient()
            await createMigrationTableIfNotExists()
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0002');`)
            await dbClient.run(`INSERT INTO ${MIGRATION_TABLE_NAME} VALUES('0001');`)

            const version = await getCurrentSchemaVersion()
            expect(typeof version).toBe('string')
            expect(version).toBe('0002')
        })
    })

    describe('getMigrations', () => {
        test('when directory is empty', () => {
            mockTestFs('fakedir', [])

            const migrations = getMigrations('fakedir')
            expect(migrations.length).toBe(0)
        })

        test('when directory has migration files', () => {
            // Intentionally out of order to test it returns everything in asc order
            mockTestFs('fakedir', [
                {
                    fileName: '0001_migration.sql',
                    fileContents: `
                        ${MIGRATE_UP_MARKER}
                        0001 up
                        ${MIGRATE_DOWN_MARKER}
                        0001 down
                    `,
                },
                {
                    fileName: '0002_migration.sql',
                    fileContents: `
                        ${MIGRATE_UP_MARKER}
                        0002 up
                        ${MIGRATE_DOWN_MARKER}
                        0002 down
                    `,
                },
                {
                    fileName: '0000_migration.sql',
                    fileContents: `
                        ${MIGRATE_UP_MARKER}
                        0000 up
                        ${MIGRATE_DOWN_MARKER}
                        0000 down
                    `,
                },
            ])

            const migrations = getMigrations('fakedir')
            expect(migrations.length).toBe(3)

            for (let i = 0; i < 3; i++) {
                const version = i.toString().padStart(4, '0')
                expect(migrations[i].version).toBe(version)
                expect(migrations[i].upSql).toContain(`${version} up`)
                expect(migrations[i].downSql).toContain(`${version} down`)
            }
        })
    })
})

function mockTestFs(mockDir: string, mockFiles: Array<{ fileName: string; fileContents: string }>): void {
    const mockDirPath = path.resolve(mockDir)
    const mockFileNames = mockFiles.map((file) => file.fileName)
    const mockFileFullPaths = mockFileNames.map((fileName) => path.resolve(mockDirPath, fileName))

    jest.spyOn(fs, 'readdirSync').mockImplementation((dirPath) => {
        if (mockDirPath === dirPath) {
            return []
        }

        return mockFileNames as unknown as ReturnType<typeof fs['readdirSync']>
    })

    const statSync = (fullPath: string) => {
        const fileDir = path.dirname(fullPath)
        if (fileDir !== mockDirPath) {
            return undefined
        }

        return {
            isFile: () => mockFileFullPaths.includes(fullPath),
        }
    }

    jest.spyOn(fs, 'statSync').mockImplementation(statSync as unknown as typeof fs['statSync'])

    jest.spyOn(fs, 'readFileSync').mockImplementation((fileFullPath) => {
        if (typeof fileFullPath !== 'string') {
            throw new Error(`Mock file "${fileFullPath.toString()}" does not exist`)
        }

        if (!statSync(fileFullPath)?.isFile()) {
            throw new Error(`Mock file "${fileFullPath.toString()}" does not exist`)
        }

        const mockFile = mockFiles.find((file) => fileFullPath.includes(file.fileName))
        assert(mockFile)
        return mockFile.fileContents
    })
}
