import { hasField, hasExpectedNumFields } from '@common/utils'

// ----------------------------------------------------------------------------
// Session Members
// ----------------------------------------------------------------------------

export interface OauthState {
    secret: string
    restorePath: string
}

export function isOauthState(obj?: unknown): obj is OauthState {
    return hasExpectedNumFields(obj, 2) &&
        hasField(obj, 'secret', 'string') &&
        hasField(obj, 'restorePath', 'string')
}
