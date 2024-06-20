import { MAL_API_URL } from '@/common/Constants'
import { DrizzleClient } from '@/common/db/createDb'
import { User } from '@/common/db/models/User'

// ----------------------------------------------------------------------------
// v2 API Data
// https://myanimelist.net/apiconfig/references/api/v2
// ----------------------------------------------------------------------------

export type MalError = {
    error: string
    message: string
}

export type MalUser = {
    id: number
    name: string
    gender: string
    location: string
    joined_at: string
    picture: string
}

export type MalAnimeListItem = {
    node: {
        id: number
        title: string
        main_picture: {
            medium: string
            large: string
        }
    }
    list_status: {
        status: string
        is_rewatching: boolean
        num_watched_episodes: number
        score: number
        updated_at: string
    }
}

export type MalMangaListItem = {
    node: {
        id: number
        title: string
        main_picture?: {
            medium: string
            large: string
        }
    }
    list_status: {
        status: string
        is_rereading: boolean
        num_volumes_read: number
        num_chapters_read: number
        score: number
        updated_at: string
    }
}

type MalList<T> = {
    data: Array<T>
    paging: {
        next?: string
        previous?: string
    }
}

export type MalAnimeResponse = MalList<MalAnimeListItem>
export type MalMangaResponse = MalList<MalMangaListItem>

// ----------------------------------------------------------------------------
// v2 API Data Fetch Functions
// ----------------------------------------------------------------------------

async function fetchFromMal<T>(accessToken: string, endpoint: string): Promise<T> {
    const res = await fetch(MAL_API_URL + endpoint, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (res.status !== 200) {
        throw new Error(`${res.status}: Failed to fetch: ${await res.text()}`)
    }

    return await res.json() as T
}

export function fetchMalUser(accessToken: string): Promise<MalUser> {
    return fetchFromMal<MalUser>(accessToken, '/users/@me')
}

export async function fetchMalAnimeList(db: DrizzleClient, user: User, limit = 100, offset = 0): Promise<MalAnimeResponse | null> {
    if (!user.accessToken) {
        throw new Error('Missing accessToken')
    }

    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    })

    return await fetchFromMal<MalAnimeResponse>(user.accessToken, `/users/@me/animelist?${params.toString()}`)
}

export async function fetchMalMangaList(db: DrizzleClient, user: User, limit = 100, offset = 0): Promise<MalMangaResponse | null> {
    if (!user.accessToken) {
        throw new Error('Missing accessToken')
    }

    const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
    })

    return await fetchFromMal<MalMangaResponse>(user.accessToken, `/users/@me/mangalist?${params.toString()}`)
}
