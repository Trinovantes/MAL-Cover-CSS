import { vi, describe, test, beforeEach, afterEach, expect } from 'vitest'
import { DB_MEMORY, ENCRYPTION_KEY_LENGTH } from '../../../../src/common/Constants.ts'
import { type DrizzleClient, createDb } from '../../../../src/common/db/createDb.ts'
import { getMigrations } from '../../../../src/common/db/getMigrations.ts'
import { selectUsersToDelete, selectUsersToScrape, updateUserLastChecked, updateUserTokens, upsertUser } from '../../../../src/common/db/models/User.ts'
import { getEncryptionKey } from '../../../../src/common/node/RuntimeSecret.ts'
import { getSqlTimestamp, getSqlTimestampFromNow } from '../../../../src/common/utils/getSqlTimestamp.ts'

let db: DrizzleClient

const mocks = vi.hoisted(() => {
    return {
        getEncryptionKey: vi.fn(),
        getSqlTimestamp: vi.fn(),
    }
})

vi.mock('../../../../src/common/node/RuntimeSecret.ts', () => {
    return {
        getEncryptionKey: mocks.getEncryptionKey,
    }
})

vi.mock('../../../../src/common/utils/getSqlTimestamp.ts', async () => {
    const original = await vi.importActual<typeof import('../../../../src/common/utils/getSqlTimestamp.ts')>('../../../../src/common/utils/getSqlTimestamp.ts')

    return {
        ...original,
        getSqlTimestamp: mocks.getSqlTimestamp,
    }
})

beforeEach(async () => {
    db = await createDb(DB_MEMORY, {
        migrations: await getMigrations(),
    })

    vi.mocked(getEncryptionKey).mockReturnValue(Buffer.alloc(ENCRYPTION_KEY_LENGTH, '0'))
    vi.mocked(getSqlTimestamp).mockReturnValue('Mocked Date')
})

afterEach(() => {
    db.$client.close()
})

describe('upsertUser', () => {
    test('when user does not exist', () => {
        const user = upsertMockUser(42, 'trinovantes')
        expect(user.id).toBe(1)
        expect(user.malUserId).toBe(42)
        expect(user.malUsername).toBe('trinovantes')
        expect(user.lastChecked).toBeNull()
    })

    test('when user does not exist in non-empty db', () => {
        for (let malUserId = 1; malUserId <= 10; malUserId++) {
            upsertMockUser(malUserId)
        }

        const user = upsertMockUser(11)
        expect(user.id).toBe(11)
    })

    test('when user already exists', () => {
        const oldDate = 'Date 1'
        const newDate = 'Date 2'
        const oldTokenDate = 'Token Date 1'
        const newTokenDate = 'Token Date 2'
        const oldToken = 'token 1'
        const newToken = 'token 2'

        vi.mocked(getSqlTimestamp).mockReturnValue(oldDate)
        const oldUser = upsertUser(db, {
            malUserId: 42,
            malUsername: 'trinovantes',
            tokenExpires: oldTokenDate,
            accessToken: oldToken,
            refreshToken: oldToken,
        })

        vi.mocked(getSqlTimestamp).mockReturnValue(newDate)
        const newUser = upsertUser(db, {
            malUserId: 42,
            malUsername: 'trinovantes',
            tokenExpires: newTokenDate,
            accessToken: newToken,
            refreshToken: newToken,
        })

        expect(newUser.malUserId).toBe(oldUser.malUserId)
        expect(newUser.malUsername).toBe(oldUser.malUsername)
        expect(newUser.lastChecked).toBeNull()
        expect(newUser.tokenExpires).toBe(newTokenDate)
        expect(newUser.accessToken).toBe(newToken)
        expect(newUser.refreshToken).toBe(newToken)
        expect(newUser.createdAt).toBe(oldDate)
        expect(newUser.updatedAt).toBe(newDate)
    })
})

describe('selectUsersToScrape', () => {
    test('invalid timestamp throws', () => {
        expect(() => selectUsersToScrape(db, 'fake date')).toThrowError()
    })

    test('new user is scheduled', () => {
        const now = getSqlTimestampFromNow(0)
        const user = upsertMockUser()
        const users = selectUsersToScrape(db, now)
        expect(users.length).toBe(1)
        expect(users[0].id).toBe(user.id)
    })

    test('recently checked user is not scheduled', () => {
        const past = getSqlTimestampFromNow(-3600)
        const now = getSqlTimestampFromNow(0)
        const future = getSqlTimestampFromNow(3600)

        const user1 = upsertMockUser()
        updateUserLastChecked(db, user1.id, past)

        const user2 = upsertMockUser()
        updateUserLastChecked(db, user2.id, now)

        const user3 = upsertMockUser()
        updateUserLastChecked(db, user3.id, future)

        const users = selectUsersToScrape(db, now)
        expect(users.length).toBe(1)
        expect(users[0].id).toBe(user1.id)
    })
})

describe('selectUsersToDelete', () => {
    test('new user is not scheduled', () => {
        upsertMockUser()
        const users = selectUsersToDelete(db)
        expect(users.length).toBe(0)
    })

    test('user without tokens is scheduled', () => {
        const user = upsertMockUser()
        updateUserTokens(db, user.id, {
            tokenExpires: null,
            accessToken: null,
            refreshToken: null,
        })
        const users = selectUsersToDelete(db)
        expect(users.length).toBe(1)
        expect(users[0].id).toBe(user.id)
    })
})

describe('updateUserLastChecked', () => {
    test('invalid timestamp throws', () => {
        const user = upsertMockUser()
        expect(() => updateUserLastChecked(db, user.id, 'fake date')).toThrowError()
    })

    test('lastChecked is updated', () => {
        const now = getSqlTimestampFromNow(0)
        const user = upsertMockUser()
        const updatedUser = updateUserLastChecked(db, user.id, now)
        expect(updatedUser?.id).toBe(user.id)
        expect(updatedUser?.lastChecked).toBe(now)
    })
})

describe('updateUserTokens', () => {
    test('invalid timestamp throws', () => {
        const token = 'Hello World'
        const user = upsertMockUser()
        expect(() => updateUserTokens(db, user.id, { tokenExpires: 'invalid date', accessToken: token, refreshToken: token })).toThrowError()
    })

    test('partial null tokens throws', () => {
        const token = 'Hello World'
        const now = getSqlTimestampFromNow(0)
        const user = upsertMockUser()
        expect(() => updateUserTokens(db, user.id, { tokenExpires: null, accessToken: token, refreshToken: token })).toThrowError()
        expect(() => updateUserTokens(db, user.id, { tokenExpires: now, accessToken: null, refreshToken: token })).toThrowError()
        expect(() => updateUserTokens(db, user.id, { tokenExpires: now, accessToken: token, refreshToken: null })).toThrowError()
    })

    test('tokens can be retrieved later', () => {
        const token = 'Hello World'
        const hourAgo = getSqlTimestampFromNow(-3600)
        const now = getSqlTimestampFromNow(0)

        const user = upsertMockUser()
        updateUserTokens(db, user.id, { tokenExpires: hourAgo, accessToken: token, refreshToken: token })

        const users = selectUsersToScrape(db, now)
        expect(users.length).toBe(1)
        expect(users[0].accessToken).toBe(token)
        expect(users[0].refreshToken).toBe(token)
    })
})

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

let mockedUsers = 0

function upsertMockUser(malUserId?: number, malUsername = 'trinovantes') {
    return upsertUser(db, {
        malUserId: (malUserId ?? mockedUsers++),
        malUsername,
        tokenExpires: getSqlTimestamp(),
        accessToken: 'Mock Token',
        refreshToken: 'Mock Token',
    })
}
