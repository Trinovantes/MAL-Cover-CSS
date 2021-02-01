import { readFileSync } from 'fs'
import Constants from './Constants'

export enum Secrets {
    ENCRYPTION_KEY = 'ENCRYPTION_KEY',
    MAL_CLIENT_ID = 'MAL_CLIENT_ID',
    MAL_CLIENT_SECRET = 'MAL_CLIENT_SECRET',
    MYSQL_HOST = 'MYSQL_HOST',
    MYSQL_DATABASE = 'MYSQL_DATABASE',
    MYSQL_USER = 'MYSQL_USER',
    MYSQL_PASSWORD = 'MYSQL_PASSWORD'
}

const secretsCache: Partial<Record<Secrets, string>> = {}

export function getSecret(key: Secrets): string {
    if (!(key in secretsCache)) {
        const fileContents = readFileSync(`/run/secrets/${key}`)
        secretsCache[key] = fileContents.toString('utf-8').trim()
    }

    return secretsCache[key] as string
}

export function getEncryptionKey(): Buffer {
    const key64 = getSecret(Secrets.ENCRYPTION_KEY)
    const key = Buffer.from(key64, 'base64')

    if (key.length !== Constants.ENCRYPTION_KEY_LENGTH) {
        throw new Error(`Encryption key is incorrect size:${key.length} required:${Constants.ENCRYPTION_KEY_LENGTH}`)
    }

    return key
}
