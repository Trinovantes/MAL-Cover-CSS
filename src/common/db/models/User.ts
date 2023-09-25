import { InferSelectModel, sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { DrizzleClient } from '../createDb'
import { getSqlTimestamp, isValidSqlTimestamp } from '@/common/utils/getSqlTimestamp'
import { decrypt, encrypt } from '@/common/node/encryption'

export const userTable = sqliteTable('User', {
    id: integer('id').primaryKey(),

    malUserId: integer('malUserId').notNull().unique(),
    malUsername: text('malUsername').notNull(),
    lastChecked: text('lastChecked'),
    tokenExpires: text('tokenExpires'),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),

    createdAt: text('createdAt').notNull(),
    updatedAt: text('updatedAt').notNull(),
})

export type User = InferSelectModel<typeof userTable>

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

export function stringifyUser(user: Pick<User, 'malUsername' | 'malUserId'>) {
    return `User:${user.malUsername}(${user.malUserId})`
}

export function decryptUser(user: User): User {
    return {
        ...user,
        accessToken: user.accessToken === null ? null : decrypt(user.accessToken),
        refreshToken: user.refreshToken === null ? null : decrypt(user.refreshToken),
    }
}

export function upsertUser(db: DrizzleClient, payload: Pick<User, 'malUserId' | 'malUsername' | 'tokenExpires' | 'accessToken' | 'refreshToken'>) {
    if (!(payload.tokenExpires !== null && payload.accessToken !== null && payload.refreshToken !== null)) {
        throw new Error('Invalid token')
    }

    const now = getSqlTimestamp()
    const encryptedAccessToken = encrypt(payload.accessToken)
    const encryptedRefreshToken = encrypt(payload.refreshToken)

    return db
        .insert(userTable)
        .values({
            malUsername: payload.malUsername,
            malUserId: payload.malUserId,
            lastChecked: null,
            tokenExpires: payload.tokenExpires,
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,

            createdAt: now,
            updatedAt: now,
        })
        .onConflictDoUpdate({
            target: userTable.malUserId,
            set: {
                malUsername: payload.malUsername,
                tokenExpires: payload.tokenExpires,
                accessToken: encryptedAccessToken,
                refreshToken: encryptedRefreshToken,
                updatedAt: now,
            },
        })
        .returning()
        .all().map(decryptUser)[0]
}

export function selectUser(db: DrizzleClient, malUserId: number) {
    return db
        .select({
            id: userTable.id,
            malUserId: userTable.malUserId,
            malUsername: userTable.malUsername,
            lastChecked: userTable.lastChecked,
        })
        .from(userTable)
        .where(sql`${userTable.malUserId} = ${malUserId}`)
        .get()
}

export function selectUsersToScrape(db: DrizzleClient, staleTime: string) {
    if (!isValidSqlTimestamp(staleTime)) {
        throw new Error(`Invalid timestamp:${staleTime}`)
    }

    return db
        .select()
        .from(userTable)
        .where(sql`
            ${userTable.lastChecked} IS NULL OR
            ${userTable.lastChecked} < ${staleTime}
        `)
        .all().map(decryptUser)
}

export function selectUsersToDelete(db: DrizzleClient) {
    return db
        .select()
        .from(userTable)
        .where(sql`
            ${userTable.tokenExpires} IS NULL AND
            ${userTable.accessToken} IS NULL AND
            ${userTable.refreshToken} IS NULL
        `)
        .all().map(decryptUser)
}

export function updateUserLastChecked(db: DrizzleClient, id: number, lastChecked: string) {
    if (!isValidSqlTimestamp(lastChecked)) {
        throw new Error(`Invalid timestamp:${lastChecked}`)
    }

    return db
        .update(userTable)
        .set({ lastChecked })
        .where(sql`${userTable.id} = ${id}`)
        .returning()
        .all().map(decryptUser)[0]
}

export function updateUserTokens(db: DrizzleClient, id: number, payload: Pick<User, 'tokenExpires' | 'accessToken' | 'refreshToken'>) {
    if (payload.tokenExpires && !isValidSqlTimestamp(payload.tokenExpires)) {
        throw new Error(`Invalid timestamp:${payload.tokenExpires}`)
    }
    if (!(payload.tokenExpires === null && payload.accessToken === null && payload.refreshToken === null) &&
        !(payload.tokenExpires !== null && payload.accessToken !== null && payload.refreshToken !== null)) {
        throw new Error('Tokens must all be null or non-null')
    }

    if (payload.accessToken) {
        payload.accessToken = encrypt(payload.accessToken)
    }
    if (payload.refreshToken) {
        payload.refreshToken = encrypt(payload.refreshToken)
    }

    return db
        .update(userTable)
        .set({
            ...payload,
            updatedAt: getSqlTimestamp(),
        })
        .where(sql`${userTable.id} = ${id}`)
        .returning()
        .all().map(decryptUser)[0]
}

export function deleteUser(db: DrizzleClient, id: number) {
    return db
        .delete(userTable)
        .where(sql`${userTable.id} = ${id}`)
        .returning()
        .all().map(decryptUser)[0]
}
