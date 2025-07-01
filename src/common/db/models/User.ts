import { type InferSelectModel, sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { decrypt, encrypt } from '../../node/encryption.ts'
import type { DrizzleClient } from '../createDb.ts'
import { getSqlTimestamp, isValidSqlTimestamp } from '../../utils/getSqlTimestamp.ts'

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
export type UserData = Pick<User, 'id' | 'malUserId' | 'malUsername' | 'lastChecked'>

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

export function stringifyUser(user: Pick<User, 'malUsername' | 'malUserId'>): string {
    return `User:${user.malUsername}(${user.malUserId})`
}

export function decryptUser(user: User): User {
    return {
        ...user,
        accessToken: user.accessToken === null ? null : decrypt(user.accessToken),
        refreshToken: user.refreshToken === null ? null : decrypt(user.refreshToken),
    }
}

export function upsertUser(db: DrizzleClient, payload: Pick<User, 'malUserId' | 'malUsername' | 'tokenExpires' | 'accessToken' | 'refreshToken'>): User {
    if (!(payload.tokenExpires !== null && payload.accessToken !== null && payload.refreshToken !== null)) {
        throw new Error('Invalid token')
    }

    const now = getSqlTimestamp()
    const encryptedAccessToken = encrypt(payload.accessToken)
    const encryptedRefreshToken = encrypt(payload.refreshToken)

    const user = db
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
        .get()

    return decryptUser(user)
}

export function selectUser(db: DrizzleClient, malUserId: number): UserData | null {
    return db
        .select({
            id: userTable.id,
            malUserId: userTable.malUserId,
            malUsername: userTable.malUsername,
            lastChecked: userTable.lastChecked,
        })
        .from(userTable)
        .where(sql`${userTable.malUserId} = ${malUserId}`)
        .get() ?? null
}

export function selectUsersToScrape(db: DrizzleClient, staleTime: string): Array<User> {
    if (!isValidSqlTimestamp(staleTime)) {
        throw new Error(`Invalid timestamp:${staleTime}`)
    }

    const users = db
        .select()
        .from(userTable)
        .where(sql`
            ${userTable.lastChecked} IS NULL OR
            ${userTable.lastChecked} < ${staleTime}
        `)
        .all()

    return users.map(decryptUser)
}

export function selectUsersToDelete(db: DrizzleClient): Array<User> {
    const users = db
        .select()
        .from(userTable)
        .where(sql`
            ${userTable.tokenExpires} IS NULL AND
            ${userTable.accessToken} IS NULL AND
            ${userTable.refreshToken} IS NULL
        `)
        .all()

    return users.map(decryptUser)
}

export function updateUserLastChecked(db: DrizzleClient, id: number, lastChecked: string): User | null {
    if (!isValidSqlTimestamp(lastChecked)) {
        throw new Error(`Invalid timestamp:${lastChecked}`)
    }

    const user = db
        .update(userTable)
        .set({ lastChecked })
        .where(sql`${userTable.id} = ${id}`)
        .returning()
        .get() as User | undefined

    if (!user) {
        return null
    }

    return decryptUser(user)
}

export function updateUserTokens(db: DrizzleClient, id: number, payload: Pick<User, 'tokenExpires' | 'accessToken' | 'refreshToken'>): User | null {
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

    const user = db
        .update(userTable)
        .set({
            ...payload,
            updatedAt: getSqlTimestamp(),
        })
        .where(sql`${userTable.id} = ${id}`)
        .returning()
        .get() as User | undefined

    if (!user) {
        return null
    }

    return decryptUser(user)
}

export function deleteUser(db: DrizzleClient, id: number): User | null {
    const user = db
        .delete(userTable)
        .where(sql`${userTable.id} = ${id}`)
        .returning()
        .get() as User | undefined

    if (!user) {
        return null
    }

    return decryptUser(user)
}
