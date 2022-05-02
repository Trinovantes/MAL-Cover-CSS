import querystring from 'querystring'
import axios from 'axios'
import { MAL_AUTHORIZE_URL, MAL_TOKEN_URL } from '@/common/Constants'
import { getSecret, RuntimeSecret } from '@/common/utils/RuntimeSecret'
import type { OauthState } from '@/web/server/schemas/OauthState'
import { isOauthFailure } from './schemas/OauthFailure'
import { isOauthTokenSuccess, OauthTokenSuccess } from './schemas/OauthTokenSuccess'

// ----------------------------------------------------------------------------
// v1 API Oauth Responses
// These are returned via URL queries and should be validated for their structures
// before being parsed (to avoid hijacking attempts)
// ----------------------------------------------------------------------------

export function getOauthEndpoint(oauthState: OauthState): string {
    const query = {
        client_id: getSecret(RuntimeSecret.MAL_CLIENT_ID),
        redirect_uri: `${DEFINE.APP_URL}/api/oauth`,
        response_type: 'code',
        state: encodeURIComponent(JSON.stringify(oauthState)),
        code_challenge: oauthState.secret,
        code_challenge_method: 'plain',
    }

    const url = `${MAL_AUTHORIZE_URL}?${querystring.stringify(query)}`
    return url
}

export async function fetchAccessToken(authCode: string, codeChallenge: string, redirectUrl: string): Promise<OauthTokenSuccess> {
    const query = {
        client_id: getSecret(RuntimeSecret.MAL_CLIENT_ID),
        client_secret: getSecret(RuntimeSecret.MAL_CLIENT_SECRET),
        grant_type: 'authorization_code',
        code: authCode,
        code_verifier: codeChallenge,
        redirect_uri: redirectUrl,
    }

    console.info('Fetching (fetchAccessToken)', MAL_TOKEN_URL)
    const res = await axios.post(MAL_TOKEN_URL, querystring.stringify(query))
    const malRes = res.data as unknown

    if (isOauthFailure(malRes)) {
        throw new Error(`Failed to obtain access token (${malRes.error})`)
    }

    if (!isOauthTokenSuccess(malRes)) {
        throw new Error(`Unexpected malRes: ${JSON.stringify(malRes)}`)
    }

    return malRes
}

export async function refreshAccessToken(refreshToken: string): Promise<OauthTokenSuccess> {
    const query = {
        client_id: getSecret(RuntimeSecret.MAL_CLIENT_ID),
        client_secret: getSecret(RuntimeSecret.MAL_CLIENT_SECRET),
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    }

    console.info('Fetching (refreshAccessToken)', MAL_TOKEN_URL)
    const res = await axios.post(MAL_TOKEN_URL, querystring.stringify(query))
    const malRes = res.data as unknown

    if (isOauthFailure(malRes)) {
        throw new Error(`Failed to obtain access token (${malRes.error})`)
    }

    if (!isOauthTokenSuccess(malRes)) {
        throw new Error(`Unexpected malRes: ${JSON.stringify(malRes)}`)
    }

    return malRes
}
