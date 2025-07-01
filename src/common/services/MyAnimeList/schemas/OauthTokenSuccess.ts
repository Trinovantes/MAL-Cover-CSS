import { Type, type Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const tbOauthTokenSuccess = Type.Object({
    token_type: Type.String(),
    expires_in: Type.Number(),
    access_token: Type.String(),
    refresh_token: Type.String(),
}, {
    additionalProperties: false,
})

export type OauthTokenSuccess = Static<typeof tbOauthTokenSuccess>

export function isOauthTokenSuccess(obj?: unknown): obj is OauthTokenSuccess {
    return Value.Check(tbOauthTokenSuccess, obj)
}
