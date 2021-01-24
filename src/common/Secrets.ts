import { readFileSync } from 'fs'

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
