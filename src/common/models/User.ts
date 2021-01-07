import crypto from 'crypto'
import { Model, DataTypes } from 'sequelize'

import Constants from '@common/Constants'
import { sequelize } from './db'

const encryptionKey = getEncryptionKey()
const textEncoding = 'utf8'
const databaseEncoding = 'base64'

function getEncryptionKey(): Buffer {
    const key64 = process.env.ENCRYPTION_KEY
    if (!key64) {
        throw new Error('Encryption key undefined in env')
    }

    const key = Buffer.from(key64, 'base64')
    if (key.length !== Constants.ENCRYPTION_KEY_LENGTH) {
        throw new Error(`Encryption key is incorrect size: ${key.length} required:${Constants.ENCRYPTION_KEY_LENGTH}`)
    }

    return key
}

export interface UserAttributes {
    id: number
    username: string
    malUserId: number
    lastChecked: Date | null

    tokenExpires: Date | null
    accessToken: string | null
    refreshToken: string | null
}

interface UserCreationAttributes {
    malUserId: number
}

class User extends Model<UserAttributes, UserCreationAttributes> {
    id!: number
    username!: string
    malUserId!: number
    lastChecked!: Date | null

    tokenExpires!: Date | null
    accessToken!: string | null
    refreshToken!: string | null

    encrypt(plainText: string): string {
        const iv = crypto.randomBytes(Constants.ENCRYPTION_IV_LENGTH)
        const cipher = crypto.createCipheriv(Constants.ENCRYPTION_ALGORITHM, encryptionKey, iv) as crypto.CipherGCM
        const cipherText = Buffer.concat([cipher.update(plainText, textEncoding), cipher.final()])
        const authTag = cipher.getAuthTag()

        return Buffer.concat([iv, authTag, cipherText]).toString(databaseEncoding)
    }

    decrypt(encodedParts: string): string {
        const authLen = Constants.ENCRYPTION_AUTH_TAG_LENGTH
        const ivLen = Constants.ENCRYPTION_IV_LENGTH

        const encoded = Buffer.from(encodedParts, databaseEncoding)
        const iv = encoded.subarray(0, ivLen)
        const authTag = encoded.subarray(ivLen, ivLen + authLen)
        const cipherText = encoded.subarray(ivLen + authLen)

        const decipher = crypto.createDecipheriv(Constants.ENCRYPTION_ALGORITHM, encryptionKey, iv) as crypto.DecipherGCM
        decipher.setAuthTag(authTag)
        const plainText = decipher.update(cipherText.toString(databaseEncoding), databaseEncoding, textEncoding) + decipher.final(textEncoding)

        return plainText
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },

    username: {
        type: DataTypes.STRING,
    },

    malUserId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
    },

    lastChecked: {
        type: DataTypes.DATE,
    },

    tokenExpires: {
        type: DataTypes.DATE,
    },

    accessToken: {
        type: DataTypes.STRING(2048),

        get(): string | null {
            const storedValue = this.getDataValue('accessToken')
            return storedValue ? this.decrypt(storedValue) : null
        },

        set(value: string | null) {
            this.setDataValue('accessToken', value ? this.encrypt(value) : null)
        },
    },

    refreshToken: {
        type: DataTypes.STRING(2048),

        get(): string | null {
            const storedValue = this.getDataValue('refreshToken')
            return storedValue ? this.decrypt(storedValue) : null
        },

        set(value: string | null) {
            this.setDataValue('refreshToken', value ? this.encrypt(value) : null)
        },
    },
}, {
    sequelize: sequelize,
    tableName: 'Users',
    freezeTableName: true,
})

export { User }
