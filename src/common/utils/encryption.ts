import crypto from 'crypto'
import { ENCRYPTION_ALGORITHM, ENCRYPTION_AUTH_TAG_LENGTH, ENCRYPTION_IV_LENGTH } from '@/common/Constants'
import { getEncryptionKey } from '@/common/utils/RuntimeSecret'

const textEncoding = 'utf8'
const databaseEncoding = 'base64'

export function encrypt(plainText: string): string {
    const encryptionKey = getEncryptionKey()

    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH)
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv)
    const cipherText = Buffer.concat([cipher.update(plainText, textEncoding), cipher.final()])
    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, cipherText]).toString(databaseEncoding)
}

export function decrypt(encodedParts: string): string {
    const encryptionKey = getEncryptionKey()
    const authLen = ENCRYPTION_AUTH_TAG_LENGTH
    const ivLen = ENCRYPTION_IV_LENGTH

    const encoded = Buffer.from(encodedParts, databaseEncoding)
    const iv = encoded.subarray(0, ivLen)
    const authTag = encoded.subarray(ivLen, ivLen + authLen)
    const cipherText = encoded.subarray(ivLen + authLen)

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv)
    decipher.setAuthTag(authTag)
    const plainText = decipher.update(cipherText.toString(databaseEncoding), databaseEncoding, textEncoding) + decipher.final(textEncoding)

    return plainText
}
