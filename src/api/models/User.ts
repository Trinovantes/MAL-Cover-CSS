import { decrypt, encrypt } from '@/api/utils/encryption'
import { UserResponse } from '@/common/schemas/ApiResponse'
import assert from 'assert'
import { dbPromise } from './db'
import { CreationOmit, DefaultColumns } from './Model'
import { getSqlTimestamp } from '@/api/utils/getSqlTimestamp'

// ----------------------------------------------------------------------------
// User
// ----------------------------------------------------------------------------

type UserAttributes = DefaultColumns &{
    malUserId: number
    malUsername: string
    lastChecked: string | null
    tokenExpires: string | null
    accessToken: string | null
    refreshToken: string | null
}

export class User {
    static readonly TABLE = 'Users'

    private _attrs: UserAttributes
    private _isDeleted = false

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------

    static async upsert(attrs: Omit<UserAttributes, CreationOmit | 'lastChecked'>): Promise<User> {
        assert(attrs.tokenExpires)
        assert(attrs.accessToken)
        assert(attrs.refreshToken)

        const encryptedAccessToken = encrypt(attrs.accessToken)
        const encryptedRefreshToken = encrypt(attrs.refreshToken)
        const now = getSqlTimestamp()

        const db = await dbPromise
        const result = await db.run(`
            INSERT INTO ${User.TABLE}(malUsername, malUserId, lastChecked, tokenExpires, accessToken, refreshToken, createdAt, updatedAt)
            VALUES(@malUsername, @malUserId, NULL, @tokenExpires, @accessToken, @refreshToken, @createdAt, @updatedAt)
                ON CONFLICT(malUserId) DO UPDATE
                    SET
                        malUsername = @malUsername      ,
                        tokenExpires = @tokenExpires    ,
                        accessToken = @accessToken      ,
                        refreshToken = @refreshToken    ,
                        updatedAt = @updatedAt
        ;`, {
            '@malUsername': attrs.malUsername,
            '@malUserId': attrs.malUserId,
            '@tokenExpires': attrs.tokenExpires,
            '@accessToken': encryptedAccessToken,
            '@refreshToken': encryptedRefreshToken,
            '@createdAt': now,
            '@updatedAt': now,
        })

        if (result.lastID === undefined || result.changes !== 1) {
            throw new Error('Failed to upsert User')
        }

        const user = await User.fetch(attrs.malUserId)
        if (!user) {
            throw new Error(`Failed to find upserted User ${result.lastID}`)
        }

        return user
    }

    static async fetch(malUserId: number): Promise<User | null> {
        const db = await dbPromise
        const userAttrs = await db.get<UserAttributes>(`
            SELECT * FROM ${User.TABLE}
            WHERE malUserId = @malUserId
        ;`, {
            '@malUserId': malUserId,
        })

        if (!userAttrs) {
            return null
        }

        return new User(userAttrs)
    }

    static async fetchAllToScrape(staleTime: Date): Promise<Array<User>> {
        const db = await dbPromise
        const rows = await db.all<Array<UserAttributes>>(`
            SELECT * FROM ${User.TABLE}
            WHERE lastChecked IS NULL
            OR    lastChecked < @staleTime
        ;`, {
            '@staleTime': getSqlTimestamp(staleTime),
        })

        return rows.map((row) => new User(row))
    }

    static async fetchAllToDelete(): Promise<Array<User>> {
        const db = await dbPromise
        const rows = await db.all<Array<UserAttributes>>(`
            SELECT * FROM ${User.TABLE}
            WHERE tokenExpires IS NULL
            AND   accessToken IS NULL
            AND   refreshToken IS NULL
        ;`)

        return rows.map((row) => new User(row))
    }

    private constructor(attrs: UserAttributes) {
        this._attrs = Object.assign({}, attrs)
    }

    // ------------------------------------------------------------------------
    // Actions
    // ------------------------------------------------------------------------

    async destroy(): Promise<void> {
        assert(!this._isDeleted)

        const db = await dbPromise
        const result = await db.run(`
            DELETE FROM ${User.TABLE}
            WHERE id = @id
        ;`, {
            '@id': this._attrs.id,
        })

        if (result.changes !== 1) {
            throw new Error(`Failed to delete ${this.toString()}`)
        }

        this._isDeleted = true
    }

    async updateLastChecked(lastChecked: string): Promise<void> {
        assert(!this._isDeleted)

        const db = await dbPromise
        const result = await db.run(`
            UPDATE ${User.TABLE}
            SET
                lastChecked = @lastChecked
            WHERE
                id = @id
        ;`, {
            '@lastChecked': lastChecked,
            '@id': this._attrs.id,
        })

        if (result.changes !== 1) {
            throw new Error(`Failed to update ${this.toString()}`)
        }
    }

    async updateTokens(newAttrs: Pick<UserAttributes, 'tokenExpires' | 'accessToken' | 'refreshToken'>): Promise<void> {
        assert(!this._isDeleted)

        this.tokenExpires = newAttrs.tokenExpires
        this.accessToken = newAttrs.accessToken
        this.refreshToken = newAttrs.refreshToken

        const db = await dbPromise
        const result = await db.run(`
            UPDATE ${User.TABLE}
            SET
                tokenExpires = @tokenExpires,
                accessToken = @accessToken,
                refreshToken = @refreshToken,
                updatedAt = @updatedAt
            WHERE
                id = @id
        ;`, {
            '@tokenExpires': this.tokenExpires,
            '@accessToken': this._attrs.accessToken, // Need to access the encrypted value
            '@refreshToken': this._attrs.refreshToken, // Need to access the encrypted value
            '@updatedAt': getSqlTimestamp(),
            '@id': this.id,
        })

        if (result.changes !== 1) {
            throw new Error(`Failed to update ${this.toString()}`)
        }
    }

    // ------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------

    toString(): string {
        return `User:${this.malUsername}(${this.malUserId})`
    }

    toSessionData(): UserResponse {
        return {
            malUserId: this.malUserId,
            malUsername: this.malUsername,
            lastChecked: this.lastChecked,
        }
    }

    get id(): number {
        return this._attrs.id
    }

    get malUserId(): number {
        return this._attrs.malUserId
    }

    get malUsername(): string {
        return this._attrs.malUsername
    }

    get lastChecked(): string | null {
        return this._attrs.lastChecked
    }

    set tokenExpires(val: string | null) {
        this._attrs.tokenExpires = val
    }

    get tokenExpires(): string | null {
        return this._attrs.tokenExpires
    }

    set accessToken(val: string | null) {
        this._attrs.accessToken = (val === null)
            ? null
            : encrypt(val)
    }

    get accessToken(): string | null {
        if (!this._attrs.accessToken) {
            return null
        }

        return decrypt(this._attrs.accessToken)
    }

    set refreshToken(val: string | null) {
        this._attrs.refreshToken = (val === null)
            ? null
            : encrypt(val)
    }

    get refreshToken(): string | null {
        if (!this._attrs.refreshToken) {
            return null
        }

        return decrypt(this._attrs.refreshToken)
    }
}
