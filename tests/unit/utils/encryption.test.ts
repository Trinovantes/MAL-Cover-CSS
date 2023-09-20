import { ENCRYPTION_KEY_LENGTH } from '@/common/Constants'
import { getEncryptionKey } from '@/common/node/RuntimeSecret'
import { decrypt, encrypt } from '@/common/node/encryption'
import { vi, describe, test, beforeEach, expect } from 'vitest'

const mocks = vi.hoisted(() => {
    return {
        getEncryptionKey: vi.fn(),
    }
})

vi.mock('@/common/node/RuntimeSecret', () => {
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
