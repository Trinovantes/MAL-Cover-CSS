import { ENCRYPTION_KEY_LENGTH } from '@/common/Constants'
import * as RuntimeSecretModule from '@/common/utils/RuntimeSecret'
import { decrypt, encrypt } from '@/common/utils/encryption'

beforeEach(() => {
    jest.spyOn(RuntimeSecretModule, 'getEncryptionKey').mockImplementation(() => Buffer.alloc(ENCRYPTION_KEY_LENGTH, '0'))
})

afterEach(() => {
    jest.restoreAllMocks()
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
