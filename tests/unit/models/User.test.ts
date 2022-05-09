import { DB_MEMORY, DB_MIGRATIONS_DIR, ENCRYPTION_KEY_LENGTH } from '@/common/Constants'
import * as dbClientModule from '@/common/db/client'
import { migrateDb } from '@/common/db/migration'
import { User } from '@/common/models/User'
import * as RuntimeSecretModule from '@/common/utils/RuntimeSecret'
import * as getSqlTimestampModule from '@/common/utils/getSqlTimestamp'

// ----------------------------------------------------------------------------
// Global
// ----------------------------------------------------------------------------

let testDbClient: dbClientModule.DbClient

const origGetSqlTimestamp = getSqlTimestampModule.getSqlTimestamp

beforeEach(async() => {
    testDbClient = dbClientModule.createDbClient(DB_MEMORY)
    jest.spyOn(dbClientModule, 'getDbClient').mockImplementation(() => testDbClient)
    jest.spyOn(RuntimeSecretModule, 'getEncryptionKey').mockImplementation(() => Buffer.alloc(ENCRYPTION_KEY_LENGTH, '0'))

    await migrateDb(true, DB_MIGRATIONS_DIR)
})

afterEach(async() => {
    await migrateDb(false, DB_MIGRATIONS_DIR)

    const db = await testDbClient
    await db.close()

    jest.restoreAllMocks()
})

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('User', () => {
    test('tables are created', async() => {
        const dbClient = await dbClientModule.getDbClient()
        const tables = await dbClient.all<Array<{ name: string }>>(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'table';
        `)

        expect(tables.length).toBeGreaterThan(1)
        expect(tables.findIndex((table) => table.name === User.TABLE)).not.toBe(-1)
    })

    describe('upsert', () => {
        test('when user does not exist', async() => {
            const user = await upsertUser(42, 'trinovantes')
            expect(user.id).toBe(1)
            expect(user.malUserId).toBe(42)
            expect(user.malUsername).toBe('trinovantes')
            expect(user.lastChecked).toBeNull()
        })

        test('when user does not exist in non-empty db', async() => {
            for (let malUserId = 1; malUserId <= 10; malUserId++) {
                await upsertUser(malUserId)
            }

            const user = await upsertUser(11)
            expect(user.id).toBe(11)
        })

        test('when user exists', async() => {
            const initDate = 'fake date'
            jest.spyOn(getSqlTimestampModule, 'getSqlTimestamp').mockImplementation(() => initDate)

            const oldUser = await upsertUser(42)
            expect(oldUser.updatedAt).toBe(initDate)

            const newDate = 'fake date 2'
            jest.spyOn(getSqlTimestampModule, 'getSqlTimestamp').mockImplementation(() => newDate)

            const newToken = 'token 2'
            const newUser = await User.upsert({
                malUserId: 42,
                malUsername: 'trinovantes',
                tokenExpires: newDate,
                accessToken: newToken,
                refreshToken: newToken,
            })

            expect(newUser.malUserId).toBe(42)
            expect(newUser.malUsername).toBe('trinovantes')
            expect(newUser.lastChecked).toBeNull()
            expect(newUser.accessToken).toBe(newToken)
            expect(newUser.refreshToken).toBe(newToken)
            expect(newUser.createdAt).toBe(initDate)
            expect(newUser.updatedAt).toBe(newDate)

            const dbClient = await dbClientModule.getDbClient()
            const res = await dbClient.get<{ 'COUNT(*)': number }>(`SELECT COUNT(*) FROM ${User.TABLE};`)
            expect(res?.['COUNT(*)']).toBe(1)
        })
    })

    describe('fetchAllToScrape', () => {
        test('new user is scheduled', async() => {
            const user = await upsertUser(42)
            const now = origGetSqlTimestamp()
            const users = await User.fetchAllToScrape(now)

            expect(users.length).toBe(1)
            expect(users[0].id).toBe(user.id)
        })

        test('recently checked user is not scheduled', async() => {
            const user = await upsertUser(42)
            const now = origGetSqlTimestamp()
            await user.updateLastChecked(now)
            const users = await User.fetchAllToScrape(now)

            expect(users.length).toBe(0)
        })
    })

    describe('fetchAllToDelete', () => {
        test('new user is not scheduled', async() => {
            await upsertUser(42)
            const users = await User.fetchAllToDelete()

            expect(users.length).toBe(0)
        })

        test('user without tokens is scheduled', async() => {
            const user = await upsertUser(42)
            await user.updateTokens({
                tokenExpires: null,
                accessToken: null,
                refreshToken: null,
            })
            const users = await User.fetchAllToDelete()

            expect(users.length).toBe(1)
            expect(users[0].id).toBe(user.id)
        })
    })

    describe('destroy', () => {
        test('when user exists', async() => {
            const user = await upsertUser(1)
            const destroyUser = async() => await user.destroy()

            await expect(destroyUser()).resolves.toBeUndefined()
        })

        test('when user is already deleted', async() => {
            const user = await upsertUser(1)
            const destroyUser = async() => await user.destroy()

            await expect(destroyUser()).resolves.toBeUndefined()
            await expect(destroyUser()).rejects.toThrowError()
        })
    })

    describe('updateLastChecked', () => {
        test('lastChecked is updated', async() => {
            const newVal = 'Hello World'
            const user = await upsertUser(1)
            await user.updateLastChecked(newVal)

            const updatedUser = await User.fetch(1)
            expect(updatedUser).not.toBeNull()
            expect(updatedUser?.lastChecked).toBe(newVal)
        })

        test('when user is already deleted', async() => {
            const user = await upsertUser(1)
            await user.destroy()

            await expect(() => user.updateLastChecked('test')).rejects.toThrowError()
        })
    })

    describe('updateTokens', () => {
        test('when new tokens are all non-empty string', async() => {
            const newVal = 'Hello World'
            const user = await upsertUser(1)
            await user.updateTokens({
                tokenExpires: newVal,
                accessToken: newVal,
                refreshToken: newVal,
            })

            const updatedUser = await User.fetch(1)
            expect(updatedUser).not.toBeNull()
            expect(updatedUser?.tokenExpires).toBe(newVal)
            expect(updatedUser?.accessToken).toBe(newVal)
            expect(updatedUser?.refreshToken).toBe(newVal)
        })

        test('when new tokens are all null', async() => {
            const user = await upsertUser(1)
            await user.updateTokens({
                tokenExpires: null,
                accessToken: null,
                refreshToken: null,
            })

            const updatedUser = await User.fetch(1)
            expect(updatedUser).not.toBeNull()
            expect(updatedUser?.tokenExpires).toBeNull()
            expect(updatedUser?.accessToken).toBeNull()
            expect(updatedUser?.refreshToken).toBeNull()
        })

        test('when new tokens are mixed null and non-empty string', async() => {
            const user = await upsertUser(1)
            const update = async(newAttrs: Parameters<User['updateTokens']>[0]) => await user.updateTokens(newAttrs)

            await expect(update({
                tokenExpires: 'test',
                accessToken: null,
                refreshToken: null,
            })).rejects.toThrowError()

            await expect(update({
                tokenExpires: null,
                accessToken: 'test',
                refreshToken: null,
            })).rejects.toThrowError()

            await expect(update({
                tokenExpires: null,
                accessToken: null,
                refreshToken: 'test',
            })).rejects.toThrowError()
        })

        test('when user is already deleted', async() => {
            const user = await upsertUser(1)
            await user.destroy()

            await expect(() => user.updateTokens({
                tokenExpires: null,
                accessToken: null,
                refreshToken: null,
            })).rejects.toThrowError()
        })
    })
})

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

async function upsertUser(malUserId: number, malUsername = 'test_username'): Promise<User> {
    return await User.upsert({
        malUserId,
        malUsername,
        tokenExpires: 'test',
        accessToken: 'test',
        refreshToken: 'test',
    })
}
