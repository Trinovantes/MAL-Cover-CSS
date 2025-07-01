import { Type, type Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const tbOauthAuthSuccess = Type.Object({
    state: Type.String(), // encoded JSON object
    code: Type.String(),
}, {
    additionalProperties: false,
})

export type OauthAuthSuccess = Static<typeof tbOauthAuthSuccess>

export function isOauthAuthSuccess(obj?: unknown): obj is OauthAuthSuccess {
    return Value.Check(tbOauthAuthSuccess, obj)
}
