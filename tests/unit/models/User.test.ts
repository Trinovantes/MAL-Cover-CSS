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
            const initDate = origGetSqlTimestamp(new Date('1970-01-01 00:00:00'))
            const newDate = origGetSqlTimestamp(new Date('1970-01-01 00:00:01'))
            expect(newDate).not.toBe(initDate)

            jest.spyOn(getSqlTimestampModule, 'getSqlTimestamp').mockImplementation(() => initDate)
            const oldToken = 'token 1'
            const oldUser = await User.upsert({
                malUserId: 42,
                malUsername: 'trinovantes',
                tokenExpires: newDate,
                accessToken: oldToken,
                refreshToken: oldToken,
            })

            jest.spyOn(getSqlTimestampModule, 'getSqlTimestamp').mockImplementation(() => newDate)
            const newToken = 'token 2'
            const newUser = await User.upsert({
                malUserId: 42,
                malUsername: 'trinovantes',
                tokenExpires: newDate,
                accessToken: newToken,
                refreshToken: newToken,
            })

            expect(oldUser.createdAt).toBe(initDate)
            expect(oldUser.updatedAt).toBe(initDate)

            expect(newUser.createdAt).toBe(initDate)
            expect(newUser.updatedAt).toBe(newDate)

            expect(newUser.malUserId).toBe(42)
            expect(newUser.malUsername).toBe('trinovantes')
            expect(newUser.lastChecked).toBeNull()
            expect(newUser.accessToken).toBe(newToken)
            expect(newUser.refreshToken).toBe(newToken)

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
            const destroy = () => user.destroy()
            await expect(destroy()).resolves.toBeUndefined()

            const searchedUser = await User.fetch(1)
            expect(searchedUser).toBeNull()
        })

        test('when user is deleted twice', async() => {
            const user = await upsertUser(1)
            const destroy = () => user.destroy()
            await expect(destroy()).resolves.toBeUndefined()
            await expect(destroy()).rejects.toThrowError()
        })
    })

    describe('updateLastChecked', () => {
        test('invalid date throws', async() => {
            const user = await upsertUser(1)
            const updateLastChecked = () => user.updateLastChecked('fake date')
            await expect(updateLastChecked()).rejects.toThrowError()
        })

        test('lastChecked is updated', async() => {
            const newDate = origGetSqlTimestamp()
            const user = await upsertUser(1)
            await user.updateLastChecked(newDate)
            expect(user.lastChecked).toBe(newDate)
        })

        test('when user is already deleted', async() => {
            const user = await upsertUser(1)
            await user.destroy()

            const updateLastChecked = () => user.updateLastChecked(origGetSqlTimestamp())
            await expect(updateLastChecked()).rejects.toThrowError()
        })
    })

    describe('updateTokens', () => {
        test('when new tokens are all non-empty string', async() => {
            const newDate = origGetSqlTimestamp()
            const newToken = 'Hello World'
            const user = await upsertUser(1)
            await user.updateTokens({
                tokenExpires: newDate,
                accessToken: newToken,
                refreshToken: newToken,
            })

            const updatedUser = await User.fetch(1)
            expect(updatedUser).not.toBeNull()
            expect(updatedUser?.tokenExpires).toBe(newDate)
            expect(updatedUser?.accessToken).toBe(newToken)
            expect(updatedUser?.refreshToken).toBe(newToken)
        })

        test('when new tokens are all non-empty string but tokenExpires is invalid', async() => {
            const newToken = 'Hello World'
            const user = await upsertUser(1)
            const updateTokens = () => user.updateTokens({
                tokenExpires: 'fake date',
                accessToken: newToken,
                refreshToken: newToken,
            })

            await expect(updateTokens()).rejects.toThrowError()
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
            const updateTokens = (field: keyof Parameters<User['updateTokens']>[0]) => user.updateTokens({
                tokenExpires: origGetSqlTimestamp(),
                accessToken: 'Hello World',
                refreshToken: 'Hello World',
                [field]: null,
            })

            await expect(updateTokens('tokenExpires')).rejects.toThrowError()
            await expect(updateTokens('accessToken')).rejects.toThrowError()
            await expect(updateTokens('refreshToken')).rejects.toThrowError()
        })

        test('when user is already deleted', async() => {
            const user = await upsertUser(1)
            await user.destroy()
            const updateTokens = () => user.updateTokens({
                tokenExpires: null,
                accessToken: null,
                refreshToken: null,
            })

            await expect(updateTokens()).rejects.toThrowError()
        })
    })
})

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

async function upsertUser(malUserId: number, malUsername = 'trinovantes'): Promise<User> {
    return await User.upsert({
        malUserId,
        malUsername,
        tokenExpires: origGetSqlTimestamp(),
        accessToken: 'Hello World',
        refreshToken: 'Hello World',
    })
}
