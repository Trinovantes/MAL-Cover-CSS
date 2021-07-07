import Ajv from 'ajv'

// ----------------------------------------------------------------------------
// OauthTokenSuccess
// ----------------------------------------------------------------------------

export interface OauthTokenSuccess {
    'token_type': string
    'expires_in': number
    'access_token': string
    'refresh_token': string
}

const schema = {
    type: 'object',
    properties: {
        token_type: {
            type: 'string',
        },
        expires_in: {
            type: 'number',
        },
        access_token: {
            type: 'string',
        },
        refresh_token: {
            type: 'string',
        },
    },
    required: ['token_type', 'expires_in', 'access_token', 'refresh_token'],
    additionalProperties: false,
}

const ajv = new Ajv()
const validator = ajv.compile(schema)

export function isOauthTokenSuccess(obj?: unknown): obj is OauthTokenSuccess {
    return Boolean(validator(obj))
}
