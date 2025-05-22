import { DELAY_BETWEEN_SCRAPPING, DELAY_BETWEEN_REQUESTS, ITEMS_PER_LIST_REQUEST, DB_FILE } from '@/common/Constants'
import { fetchMalAnimeList, fetchMalMangaList, MalAnimeResponse, MalMangaResponse } from '@/common/services/MyAnimeList/data'
import { getSqlTimestamp, getSqlTimestampFromNow } from '@/common/utils/getSqlTimestamp'
import { sleep } from '@/common/utils/sleep'
import { createDb, DrizzleClient } from '@/common/db/createDb'
import { User, deleteUser, selectUsersToDelete, selectUsersToScrape, stringifyUser, updateUserLastChecked, updateUserTokens } from '@/common/db/models/User'
import { ItemType } from '@/common/db/models/ItemType'
import { upsertItem } from '@/common/db/models/Item'
import { isAfter } from 'date-fns'
import { createLogger } from '@/common/node/createLogger'
import { refreshAccessToken } from '@/common/services/MyAnimeList/oauth'
import * as Sentry from '@sentry/node'
import { SENTRY_DSN } from '@/common/Constants'
import { getMigrations } from '@/common/db/getMigrations'

// ----------------------------------------------------------------------------
// Pino
// ----------------------------------------------------------------------------

const logger = createLogger()

// ----------------------------------------------------------------------------
// Sentry
// ----------------------------------------------------------------------------

Sentry.init({
    dsn: SENTRY_DSN,
    release: DEFINE.GIT_HASH,
    enabled: !DEFINE.IS_DEV,
})

// ----------------------------------------------------------------------------
// Scraper
// ----------------------------------------------------------------------------

async function scrapeUsers(db: DrizzleClient) {
    const staleUserTime = getSqlTimestampFromNow(-DELAY_BETWEEN_SCRAPPING) // 1 hour ago
    const users = selectUsersToScrape(db, staleUserTime)
    logger.info(`Found ${users.length} users to scrape staleUserTimestamp:${staleUserTime}`)

    for (const user of users) {
        logger.info(`Scraping ${stringifyUser(user)}`)
        await sleep(DELAY_BETWEEN_REQUESTS)

        const animeSuccess = await scrapeUser(db, user, 'anime')
        if (!animeSuccess) {
            continue
        }

        const mangaSuccess = await scrapeUser(db, user, 'manga')
        if (!mangaSuccess) {
            continue
        }

        updateUserLastChecked(db, user.id, getSqlTimestamp())
    }
}

async function scrapeUser(db: DrizzleClient, user: User, mediaType: ItemType, offset = 0): Promise<boolean> {
    const malList = await fetchUserList(db, user, mediaType, offset)
    if (!malList) {
        return false
    }

    for (const malItem of malList.data) {
        const malId = malItem.node.id
        const imgUrl = malItem.node.main_picture?.medium ?? null
        upsertItem(db, { mediaType, malId, imgUrl })
    }

    if (malList?.paging.next) {
        const nextOffset = offset + ITEMS_PER_LIST_REQUEST
        return await scrapeUser(db, user, mediaType, nextOffset)
    }

    return true
}

async function fetchUserList(db: DrizzleClient, user: User, mediaType: ItemType, offset: number): Promise<MalAnimeResponse | MalMangaResponse | null> {
    if (!user.tokenExpires || !user.accessToken || !user.refreshToken) {
        logger.warn(`Skipping ${stringifyUser(user)} due to missing accessToken or refreshToken`)
        return null
    }

    try {
        const now = new Date()
        const expiry = new Date(user.tokenExpires)
        const tokenHasExpired = isAfter(now, expiry)
        if (tokenHasExpired) {
            logger.info(`${stringifyUser(user)} tokens have expired, going to refresh their tokens`)
            const malRes = await refreshAccessToken(user.refreshToken)
            const updatedUser = updateUserTokens(db, user.id, {
                tokenExpires: getSqlTimestampFromNow(malRes.expires_in),
                accessToken: malRes.access_token,
                refreshToken: malRes.refresh_token,
            })

            if (!updatedUser) {
                throw new Error(`Failed to save new refreshToken (${stringifyUser(user)})`)
            }

            user = updatedUser
        }

        return (mediaType === 'anime')
            ? await fetchMalAnimeList(db, user, ITEMS_PER_LIST_REQUEST, offset)
            : await fetchMalMangaList(db, user, ITEMS_PER_LIST_REQUEST, offset)
    } catch (err) {
        if (!(err instanceof Error)) {
            throw err
        }
        if (!err.message.startsWith('[401]')) {
            throw err
        }

        logger.warn(err)
        logger.info(`Deleting ${stringifyUser(user)} because they have probably revoked their authorization`)
        deleteUser(db, user.id)

        return null
    }
}

// ----------------------------------------------------------------------------
// Clean up
// ----------------------------------------------------------------------------

function cleanUsers(db: DrizzleClient) {
    const users = selectUsersToDelete(db)
    logger.info(`Found ${users.length} users to delete`)

    for (const user of users) {
        logger.info(`Deleting ${stringifyUser(user)}`)
        deleteUser(db, user.id)
    }
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main(): Promise<void> {
    await Sentry.startSpan({
        op: 'scrapeUsers',
        name: 'Scrape Users Cron Job',
    }, async() => {
        try {
            const db = await createDb(DB_FILE, {
                cleanOnExit: true,
                migrations: await getMigrations(),
            })

            await scrapeUsers(db)
            cleanUsers(db)
        } catch (err) {
            logger.error(err)
            Sentry.captureException(err)
        }
    })
}

main().catch((err: unknown) => {
    logger.error(err)
    process.exit(1)
})
