import { Type, type Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

const tbLoginPayload = Type.Object({
    restorePath: Type.String(),
}, {
    additionalProperties: false,
})

export type LoginPayload = Static<typeof tbLoginPayload>

export function isLoginPayload(obj: unknown): obj is LoginPayload {
    return Value.Check(tbLoginPayload, obj)
}
