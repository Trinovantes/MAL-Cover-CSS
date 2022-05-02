import Ajv from 'ajv'

export interface LoginRequest {
    restorePath: string
}

const schema = {
    type: 'object',
    properties: {
        restorePath: {
            type: 'string',
        },
    },
    required: ['restorePath'],
    additionalProperties: false,
}

const ajv = new Ajv()
const validator = ajv.compile(schema)

export function isLoginRequest(obj: unknown): obj is LoginRequest {
    return Boolean(validator(obj))
}
