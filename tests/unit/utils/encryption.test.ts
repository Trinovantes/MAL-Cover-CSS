import { vi, describe, test, beforeEach, expect } from 'vitest'
import { ENCRYPTION_KEY_LENGTH } from '../../../src/common/Constants.ts'
import { getEncryptionKey } from '../../../src/common/node/RuntimeSecret.ts'
import { decrypt, encrypt } from '../../../src/common/node/encryption.ts'

const mocks = vi.hoisted(() => {
    return {
        getEncryptionKey: vi.fn(),
    }
})

vi.mock('../../../src/common/node/RuntimeSecret.ts', () => {
    return {
        getEncryptionKey: mocks.getEncryptionKey,
    }
})

beforeEach(() => {
    vi.mocked(getEncryptionKey).mockReturnValue(Buffer.alloc(ENCRYPTION_KEY_LENGTH, '0'))
})

describe('encryption', () => {
    test('encrypt empty string', () => {
        const plainText = ''
        const cipherText = encrypt(plainText)
        expect(cipherText.length).toBeGreaterThan(0)
    })

    test('encrypt and decrypt are inverses', () => {
        const plainText = 'Hello World'
        const cipherText = encrypt(plainText)
        const decrptedText = decrypt(cipherText)
        expect(decrptedText).toBe(plainText)
    })
})
