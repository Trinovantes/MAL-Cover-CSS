import { decrypt, encrypt } from '@/common/utils/encryption'

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
