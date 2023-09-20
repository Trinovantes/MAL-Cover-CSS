import { Type, Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const tbOauthState = Type.Object({
    restorePath: Type.String(),
    secret: Type.String(),
}, {
    additionalProperties: false,
})

export type OauthState = Static<typeof tbOauthState>

export function isOauthState(obj: unknown): obj is OauthState {
    return Value.Check(tbOauthState, obj)
}
