import Ajv from 'ajv'

// ----------------------------------------------------------------------------
// OauthAuthSuccess
// ----------------------------------------------------------------------------

export type OauthAuthSuccess = {
    'state': string // encoded JSON object
    'code': string
}

const schema = {
    type: 'object',
    properties: {
        state: {
            type: 'string',
        },
        code: {
            type: 'string',
        },
    },
    required: ['state', 'code'],
    additionalProperties: false,
}

const ajv = new Ajv()
const validator = ajv.compile(schema)

export function isOauthAuthSuccess(obj?: unknown): obj is OauthAuthSuccess {
    return Boolean(validator(obj))
}
