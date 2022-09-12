import Ajv from 'ajv'

// ----------------------------------------------------------------------------
// OauthFailure
// ----------------------------------------------------------------------------

export type OauthFailure = {
    'state': string // encoded JSON object
    'error': string
    'message': string
    'hint'?: string
}

const schema = {
    type: 'object',
    properties: {
        state: {
            type: 'string',
        },
        error: {
            type: 'string',
        },
        message: {
            type: 'string',
        },
        hint: {
            type: 'string',
        },
    },
    required: ['state', 'error', 'message'],
    additionalProperties: false,
}

const ajv = new Ajv()
const validator = ajv.compile(schema)

export function isOauthFailure(obj?: unknown): obj is OauthFailure {
    return Boolean(validator(obj))
}
