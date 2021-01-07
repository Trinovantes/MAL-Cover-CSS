import { hasField, hasExpectedNumFields } from '@common/utils'

export interface LoginRequest {
    restorePath?: string
}

export function isLoginRequest(obj: unknown): obj is LoginRequest {
    return hasExpectedNumFields(obj, 1) && hasField(obj, 'restorePath', 'string')
}
