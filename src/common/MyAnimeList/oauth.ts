import axios from 'axios'
import { MAL_OAUTH_URL } from '@/common/Constants'
import { getSecret, Secrets } from '@/common/utils/secrets'
import querystring from 'querystring'
import { OauthState } from '@/common/schemas/OauthState'
import { isOauthFailure } from '@/common/schemas/OauthFailure'
import { isOauthTokenSuccess, OauthTokenSuccess } from '@/common/schemas/OauthTokenSuccess'
import { getOauthRedirectUrl } from '@/api/routers/oauthRouter'

// ----------------------------------------------------------------------------
// v1 API Oauth Responses
// These are returned via URL queries and should be validated for their structures
// before being parsed (to avoid hijacking attempts)
// ----------------------------------------------------------------------------

export function getOauthEndpoint(oauthState: OauthState): string {
    const query = {
        client_id: getSecret(Secrets.MAL_CLIENT_ID),
        redirect_uri: getOauthRedirectUrl(),
        response_type: 'code',
        state: encodeURIComponent(JSON.stringify(oauthState)),
        code_challenge: oauthState.secret,
        code_challenge_method: 'plain',
    }

    const url = `${MAL_OAUTH_URL}/oauth2/authorize?${querystring.stringify(query)}`
    return url
}

export async function obtainAccessToken(authCode: string, codeChallenge: string, redirectUrl: string): Promise<OauthTokenSuccess> {
    const url = `${MAL_OAUTH_URL}/oauth2/token`
    const query = {
        client_id: getSecret(Secrets.MAL_CLIENT_ID),
        client_secret: getSecret(Secrets.MAL_CLIENT_SECRET),
        grant_type: 'authorization_code',
        code: authCode,
        code_verifier: codeChallenge,
        redirect_uri: redirectUrl,
    }

    console.info('Fetching (obtainAccessToken)', url)
    const res = await axios.post(url, querystring.stringify(query))
    const malRes = res.data as unknown

    if (isOauthFailure(malRes)) {
        console.info(malRes)
        throw new Error('Failed to obtain access token')
    }

    if (!isOauthTokenSuccess(malRes)) {
        console.info(malRes)
        throw new Error('Unexpected malRes')
    }

    return malRes
}

export async function refreshAccessToken(refreshToken: string): Promise<OauthTokenSuccess> {
    const url = `${MAL_OAUTH_URL}/oauth2/token`
    const query = {
        client_id: getSecret(Secrets.MAL_CLIENT_ID),
        client_secret: getSecret(Secrets.MAL_CLIENT_SECRET),
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    }

    console.info('Fetching (refreshAccessToken)', url)
    const res = await axios.post(url, querystring.stringify(query))
    const malRes = res.data as unknown

    if (isOauthFailure(malRes)) {
        console.info(malRes)
        throw new Error('Failed to refresh access token')
    }

    if (!isOauthTokenSuccess(malRes)) {
        console.info(malRes)
        throw new Error('Unexpected malRes')
    }

    return malRes
}
