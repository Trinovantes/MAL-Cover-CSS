import Ajv from 'ajv'

export type OauthState = {
    restorePath: string
    secret: string
}

const schema = {
    type: 'object',
    properties: {
        restorePath: {
            type: 'string',
        },
        secret: {
            type: 'string',
        },
    },
    required: ['restorePath', 'secret'],
    additionalProperties: false,
}

const ajv = new Ajv()
const validator = ajv.compile(schema)

export function isOauthState(obj?: unknown): obj is OauthState {
    return Boolean(validator(obj))
}
