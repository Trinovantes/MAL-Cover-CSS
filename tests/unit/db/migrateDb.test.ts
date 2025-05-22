import { sql } from 'drizzle-orm'
import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { DB_MEMORY } from '@/common/Constants'
import { Migration, getCurrentMigrationVersion, migrationTable } from '@/common/db/migrateDb'
import { createDb, DrizzleClient } from '@/common/db/createDb'
import { migrateDb } from '@/common/db/migrateDb'

let db: DrizzleClient

beforeEach(async() => {
    db = await createDb(DB_MEMORY)
})

afterEach(() => {
    db.$client.close()
})

test('no migrations', async() => {
    const migrations: Array<Migration> = []

    await expect(migrateDb(db, migrations)).resolves.toBe(true)
    expect(getCurrentMigrationVersion(db)).toBeNull()

    const results = db.select().from(migrationTable).all()
    expect(results.length).toBe(0)
})

test('basic migration', async() => {
    const migrations: Array<Migration> = [
        {
            version: '0000',
            run: vi.fn(),
        },
    ]

    await expect(migrateDb(db, migrations)).resolves.toBe(true)
    expect(getCurrentMigrationVersion(db)).toBe('0000')

    expect(migrations[0].run).toHaveBeenCalledTimes(1)
})

test('0/2 completed migrations', async() => {
    const migrations: Array<Migration> = [
        {
            version: '0000',
            run: (db) => {
                db.run(sql`CREATE TABLE test_table_0000(id INTEGER PRIMARY KEY)`)
            },
        },
        {
            version: '0001',
            run: (db) => {
                db.run(sql`CREATE TABLE test_table_0001(id INTEGER PRIMARY KEY)`)
            },
        },
    ]

    await expect(migrateDb(db, migrations)).resolves.toBe(true)
    expect(getCurrentMigrationVersion(db)).toBe('0001')

    const getTestTable = (id: number) => db.all(sql.raw(`SELECT * FROM test_table_000${id};`))
    expect(getTestTable(0)).toEqual([])
    expect(getTestTable(1)).toEqual([])
})

test('1/2 completed migrations', async() => {
    const migrations: Array<Migration> = [
        {
            version: '0000',
            run: vi.fn(),
        },
        {
            version: '0001',
            run: (db) => {
                db.run(sql`CREATE TABLE test_table_0001(id INTEGER PRIMARY KEY)`)
            },
        },
    ]

    db.run(sql`CREATE TABLE ${migrationTable} (version TEXT PRIMARY KEY)`)
    db.run(sql`INSERT INTO ${migrationTable} (version) VALUES ('0000')`)

    await expect(migrateDb(db, migrations)).resolves.toBe(true)
    expect(getCurrentMigrationVersion(db)).toBe('0001')

    expect(migrations[0].run).toHaveBeenCalledTimes(0)

    const getTestTable = (id: number) => db.all(sql.raw(`SELECT * FROM test_table_000${id};`))
    expect(() => getTestTable(0)).toThrow()
    expect(getTestTable(1)).toEqual([])
})

test('2/2 completed migrations', async() => {
    const migrations: Array<Migration> = [
        {
            version: '0000',
            run: vi.fn(),
        },
        {
            version: '0001',
            run: vi.fn(),
        },
    ]

    db.run(sql`CREATE TABLE ${migrationTable} (version TEXT PRIMARY KEY)`)
    db.run(sql`INSERT INTO ${migrationTable} (version) VALUES ('0000')`)
    db.run(sql`INSERT INTO ${migrationTable} (version) VALUES ('0001')`)

    await expect(migrateDb(db, migrations)).resolves.toBe(true)
    expect(getCurrentMigrationVersion(db)).toBe('0001')

    expect(migrations[0].run).toHaveBeenCalledTimes(0)
    expect(migrations[1].run).toHaveBeenCalledTimes(0)

    const getTestTable = (id: number) => db.all(sql.raw(`SELECT * FROM test_table_000${id};`))
    expect(() => getTestTable(0)).toThrow()
    expect(() => getTestTable(1)).toThrow()
})

test('concurrent migrations do not throw errors', async() => {
    const migrations: Array<Migration> = [
        {
            version: '0000',
            run: vi.fn(),
        },
        {
            version: '0001',
            run: vi.fn(),
        },
        {
            version: '0002',
            run: vi.fn(),
        },
    ]

    const concurrentMigration = async() => {
        await Promise.all([
            migrateDb(db, migrations),
            migrateDb(db, migrations),
            migrateDb(db, migrations),
            migrateDb(db, migrations),
            migrateDb(db, migrations),
        ])
    }

    await expect(concurrentMigration()).resolves.toBeUndefined()
    expect(getCurrentMigrationVersion(db)).toBe('0002')

    expect(migrations[0].run).toHaveBeenCalledTimes(1)
    expect(migrations[1].run).toHaveBeenCalledTimes(1)
    expect(migrations[2].run).toHaveBeenCalledTimes(1)
})
