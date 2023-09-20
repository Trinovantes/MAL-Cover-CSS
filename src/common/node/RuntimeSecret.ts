import fs from 'fs'
import { config } from 'dotenv'
import { ENCRYPTION_KEY_LENGTH } from '@/common/Constants'

// Loads .env into process.env
const envFile = process.env.ENV_FILE ?? '.env'
config({ path: envFile })

export enum RuntimeSecret {
    REDIS_HOST = 'REDIS_HOST',
    REDIS_PORT = 'REDIS_PORT',

    S3_BUCKET_UPLOAD = 'S3_BUCKET_UPLOAD',

    ENCRYPTION_KEY = 'ENCRYPTION_KEY',
    MAL_CLIENT_ID = 'MAL_CLIENT_ID',
    MAL_CLIENT_SECRET = 'MAL_CLIENT_SECRET',
}

const secretsCache = new Map<RuntimeSecret, string>()

export function getRuntimeSecret(key: RuntimeSecret, defaultValue?: string): string {
    // Check if it's already defined in process.env
    const envValue = process.env[key]
    if (envValue) {
        return envValue
    }

    // Check if it's in the cache
    if (secretsCache.has(key)) {
        const cachedSecret = secretsCache.get(key)
        if (cachedSecret) {
            return cachedSecret
        }
    }

    // Check if it exists as a runtime secret via Docker
    const secretsFile = `/run/secrets/${key}`
    if (fs.existsSync(secretsFile)) {
        const secret = fs.readFileSync(secretsFile).toString('utf-8')
        secretsCache.set(key, secret)
        return secret
    }

    if (defaultValue) {
        return defaultValue
    }

    // Cannot find the secret anywhere
    throw new Error(`Cannot find RuntimeSecret.${key}`)
}

export function getEncryptionKey(): Buffer {
    const key64 = getRuntimeSecret(RuntimeSecret.ENCRYPTION_KEY)
    const key = Buffer.from(key64, 'base64')

    if (key.length !== ENCRYPTION_KEY_LENGTH) {
        throw new Error(`Encryption key is incorrect size:${key.length} required:${ENCRYPTION_KEY_LENGTH}`)
    }

    return key
}
