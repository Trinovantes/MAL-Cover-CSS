import axios, { AxiosRequestConfig } from 'axios'
import { MAL_API_URL } from '@/common/Constants'
import assert from 'assert'
import { User } from '@/common/models/User'
import dayjs from 'dayjs'
import { refreshAccessToken } from './oauth'
import { getSqlTimestamp } from '@/common/utils/getSqlTimestamp'

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
    'gender': string
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
        'main_picture'?: {
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

interface MalList<T> {
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

async function fetchFromMal<T>(accessToken: string, endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const url = `${MAL_API_URL}/${endpoint}`
    const requestConfig = {
        ...config,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }

    console.info('Fetching (fetchFromMal)', url, config)
    const res = await axios.get(url, requestConfig)

    return res.data as T
}

export async function fetchMalUser(accessToken: string, config?: AxiosRequestConfig): Promise<MalUser> {
    return fetchFromMal<MalUser>(accessToken, 'users/@me', config)
}

async function fetchUserDataFromMal<T>(user: User, endpoint: string, config?: AxiosRequestConfig): Promise<T | null> {
    assert(user.tokenExpires)
    assert(user.accessToken)
    assert(user.refreshToken)

    try {
        const tokenHasExpired = dayjs(user.tokenExpires).isBefore(dayjs())
        if (tokenHasExpired) {
            console.info(`${user.toString()} tokens has expired, going to refresh tokens`)

            const malRes = await refreshAccessToken(user.refreshToken)
            const expires = getSqlTimestamp(dayjs().add(malRes.expires_in, 'seconds').toDate())

            await user.updateTokens({
                tokenExpires: expires,
                accessToken: malRes.access_token,
                refreshToken: malRes.refresh_token,
            })
        }

        return await fetchFromMal(user.accessToken, endpoint, config)
    } catch (err) {
        // Check if it's a known error
        if (axios.isAxiosError(err) && err.response?.status === 401) {
            console.info(`${user.toString()} has revoked their authorization, going delete the user`)

            await user.updateTokens({
                tokenExpires: null,
                accessToken: null,
                refreshToken: null,
            })

            return null
        }

        // Unknown error
        console.warn('Unhandled error while running fetchUserDataFromMal')
        throw err
    }
}

export async function fetchMalAnimeList(user: User, config: AxiosRequestConfig): Promise<MalAnimeResponse | null> {
    return fetchUserDataFromMal<MalAnimeResponse>(user, 'users/@me/animelist', config)
}

export async function fetchMalMangaList(user: User, config: AxiosRequestConfig): Promise<MalMangaResponse | null> {
    return fetchUserDataFromMal<MalMangaResponse>(user, 'users/@me/mangalist', config)
}
