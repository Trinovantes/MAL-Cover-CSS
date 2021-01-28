import { OauthState } from '@web/api/interfaces/Session'
import axios, { AxiosRequestConfig } from 'axios'
import dayjs from 'dayjs'
import querystring from 'querystring'

import Constants from './Constants'
import { User } from './models/User'
import { getSecret, Secrets } from './Secrets'
import { hasField, hasExpectedNumFields, isAxiosError, getHost } from './utils'
import { createLogger } from './utils/logger'

const logger = createLogger('MyAnimeList')

// ----------------------------------------------------------------------------
// v2 API Data
// ----------------------------------------------------------------------------

export interface MalError {
    'error': string
    'message': string
}

export interface MalUser {
    'id': number
    'name': string
    'gender': 'male' | 'female'
    'location': string
    'joined_at': string
    'picture': string
}

export interface MalAnimeListItem {
    'node': {
        'id': number
        'title': string
        'main_picture': {
            'medium': string
            'large': string
        }
    }
    'list_status': {
        'status': string
        'is_rewatching': boolean
        'num_watched_episodes': number
        'score': number
        'updated_at': string
    }
}

export interface MalMangaListItem {
    'node': {
        'id': number
        'title': string
        'main_picture': {
            'medium': string
            'large': string
        }
    }
    'list_status': {
        'status': string
        'is_rereading': boolean
        'num_volumes_read': number
        'num_chapters_read': number
        'score': number
        'updated_at': string
    }
}

export interface MalList<T> {
    'data': Array<T>
    'paging': {
        'next'?: string
        'previous'?: string
    }
}

export type MalAnimeResponse = MalList<MalAnimeListItem>
export type MalMangaResponse = MalList<MalMangaListItem>

// ----------------------------------------------------------------------------
// v2 API Data Fetch Functions
// ----------------------------------------------------------------------------

async function fetchFromMal<T>(accessToken: string, refreshToken: string, endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const url = `${Constants.MAL_API_URL}/${endpoint}`
    const requestConfig = {
        ...config,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }

    logger.verbose('Fetching:%s %s', url, JSON.stringify(config))
    const res = await axios.get(url, requestConfig)

    return res.data as T
}

async function fetchUserDataFromMal<T>(user: User, endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    if (!user.tokenExpires || !user.accessToken || !user.refreshToken) {
        throw new Error('User is missing accessToken or refreshToken')
    }

    try {
        const tokenExpired = dayjs(user.tokenExpires).isBefore(dayjs())
        if (tokenExpired) {
            logger.verbose('User token has expired and need to be refreshed')
            const malRes = await refreshAccessToken(user.refreshToken)
            await user.update({
                tokenExpires: dayjs().add(malRes.expires_in).toDate(),
                accessToken: malRes.access_token,
                refreshToken: malRes.refresh_token,
            })
        }

        return fetchFromMal(user.accessToken, user.refreshToken, endpoint, config)
    } catch (err) {
        if (isAxiosError(err)) {
            // Invalid token
            if (err.response?.status === 401) {
                await user.update({
                    tokenExpires: null,
                    accessToken: null,
                    refreshToken: null,
                })
            }
        }

        throw err
    }
}

export async function fetchMalUser(accessToken: string, refreshToken: string, config?: AxiosRequestConfig): Promise<MalUser> {
    return fetchFromMal<MalUser>(accessToken, refreshToken, 'users/@me', config)
}

export async function fetchMalAnimeList(user: User, config?: AxiosRequestConfig): Promise<MalAnimeResponse> {
    return fetchUserDataFromMal<MalAnimeResponse>(user, 'users/@me/animelist', config)
}

export async function fetchMalMangaList(user: User, config?: AxiosRequestConfig): Promise<MalMangaResponse> {
    return fetchUserDataFromMal<MalMangaResponse>(user, 'users/@me/mangalist', config)
}

// ----------------------------------------------------------------------------
// v1 API Oauth Responses
// These are returned via URL queries and should be validated for their structures
// before being parsed (to avoid hijacking attempts)
// ----------------------------------------------------------------------------

export interface OauthFailure {
    'state': string // encoded JSON object
    'error': string
    'message': string
    'hint'?: string
}

export interface OauthAuthSuccess {
    'state': string // encoded JSON object
    'code': string
}

export interface OauthTokenSuccess {
    'token_type': string
    'expires_in': number
    'access_token': string
    'refresh_token': string
}

export function isOauthFailure(obj?: unknown): obj is OauthFailure {
    return hasExpectedNumFields(obj, 3, 4) &&
        hasField(obj, 'state', 'string') &&
        hasField(obj, 'error', 'string') &&
        hasField(obj, 'message', 'string') &&
        hasField(obj, 'hint', 'string', true)
}

export function isOauthAuthSuccess(obj?: unknown): obj is OauthAuthSuccess {
    return hasExpectedNumFields(obj, 2) &&
        hasField(obj, 'state', 'string') &&
        hasField(obj, 'code', 'string')
}

export function isOauthTokenSuccess(obj?: unknown): obj is OauthTokenSuccess {
    return hasExpectedNumFields(obj, 4) &&
        hasField(obj, 'token_type', 'string') &&
        hasField(obj, 'expires_in', 'number') &&
        hasField(obj, 'access_token', 'string') &&
        hasField(obj, 'refresh_token', 'string')
}

export function getAuthEndpoint(oauthState: OauthState): string {
    const redirectUrl = `${getHost()}/${Constants.MAL_OAUTH_REDIRECT_URL}`
    const data = {
        client_id: getSecret(Secrets.MAL_CLIENT_ID),
        redirect_uri: redirectUrl,
        response_type: 'code',
        state: encodeURIComponent(JSON.stringify(oauthState)),
        code_challenge: oauthState.secret,
        code_challenge_method: 'plain',
    }

    const url = `${Constants.MAL_OAUTH_URL}/oauth2/authorize?${querystring.stringify(data)}`
    return url
}

export async function obtainAccessToken(authCode: string, codeChallenge: string, redirectUrl: string): Promise<OauthTokenSuccess> {
    const url = `${Constants.MAL_OAUTH_URL}/oauth2/token`
    const data = {
        client_id: getSecret(Secrets.MAL_CLIENT_ID),
        client_secret: getSecret(Secrets.MAL_CLIENT_SECRET),
        grant_type: 'authorization_code',
        code: authCode,
        code_verifier: codeChallenge,
        redirect_uri: redirectUrl,
    }

    logger.verbose('Fetching:%s %s', url, JSON.stringify(data))
    const res = await axios.post(url, querystring.stringify(data))
    const malRes = res.data as unknown

    if (isOauthFailure(malRes)) {
        logger.warn(malRes)
        throw new Error('Failed to obtain access token')
    }

    if (!isOauthTokenSuccess(malRes)) {
        logger.warn(malRes)
        throw new Error('Unexpected malRes')
    }

    return malRes
}

async function refreshAccessToken(refreshToken: string): Promise<OauthTokenSuccess> {
    const url = `${Constants.MAL_OAUTH_URL}/oauth2/token`
    const data = {
        client_id: getSecret(Secrets.MAL_CLIENT_ID),
        client_secret: getSecret(Secrets.MAL_CLIENT_SECRET),
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    }

    logger.verbose('Fetching:%s %s', url, JSON.stringify(data))
    const res = await axios.post(url, querystring.stringify(data))
    const malRes = res.data as unknown

    if (isOauthFailure(malRes)) {
        logger.warn(malRes)
        throw new Error('Failed to refresh access token')
    }

    if (!isOauthTokenSuccess(malRes)) {
        logger.warn(malRes)
        throw new Error('Unexpected malRes')
    }

    return malRes
}
