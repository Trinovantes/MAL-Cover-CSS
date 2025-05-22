import { Type, Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const tbOauthAuthFailure = Type.Object({
    state: Type.Optional(Type.String()), // encoded JSON object
    error: Type.String(),
    message: Type.String(),
    hint: Type.Optional(Type.String()),
}, {
    additionalProperties: false,
})

export type OauthAuthFailure = Static<typeof tbOauthAuthFailure>

export function isOauthAuthFailure(obj?: unknown): obj is OauthAuthFailure {
    return Value.Check(tbOauthAuthFailure, obj)
}
