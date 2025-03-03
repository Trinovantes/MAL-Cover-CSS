import * as Sentry from '@sentry/node'
import { SENTRY_DSN, DELAY_BETWEEN_SCRAPPING, DELAY_BETWEEN_REQUESTS, ITEMS_PER_LIST_REQUEST } from '@/common/Constants'
import { fetchMalAnimeList, fetchMalMangaList } from '@/common/services/MyAnimeList/data'
import { getSqlTimestamp, getSqlTimestampFromNow } from '@/common/utils/getSqlTimestamp'
import { sleep } from '@/common/utils/sleep'
import { DrizzleClient } from '@/common/db/createDb'
import { User, deleteUser, selectUsersToDelete, selectUsersToScrape, stringifyUser, updateUserLastChecked, updateUserTokens } from '@/common/db/models/User'
import { ItemType } from '@/common/db/models/ItemType'
import { upsertItem } from '@/common/db/models/Item'
import { isBefore } from 'date-fns'
import { createLogger } from '@/common/node/createLogger'
import { refreshAccessToken } from '@/common/services/MyAnimeList/oauth'
import { initDb } from '@/common/db/initDb'

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
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.0,
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
        await scrapeUser(db, user, 'anime')
        await scrapeUser(db, user, 'manga')
        updateUserLastChecked(db, user.id, getSqlTimestamp())
        await sleep(DELAY_BETWEEN_REQUESTS)
    }
}

async function scrapeUser(db: DrizzleClient, user: User, mediaType: ItemType, offset = 0) {
    const malList = await fetchUserList(db, user, mediaType, offset)

    for (const malItem of malList?.data ?? []) {
        const malId = malItem.node.id
        const imgUrl = malItem.node.main_picture?.medium ?? null
        upsertItem(db, { mediaType, malId, imgUrl })
    }

    if (malList?.paging.next) {
        const nextOffset = offset + ITEMS_PER_LIST_REQUEST
        await scrapeUser(db, user, mediaType, nextOffset)
    }
}

async function fetchUserList(db: DrizzleClient, user: User, mediaType: ItemType, offset: number) {
    if (!user.tokenExpires || !user.accessToken || !user.refreshToken) {
        logger.warn(`Skipping ${stringifyUser(user)} due to missing accessToken or refreshToken`)
        return null
    }

    try {
        const tokenHasExpired = isBefore(new Date(user.tokenExpires), new Date())
        if (tokenHasExpired) {
            logger.info(`${stringifyUser(user)} tokens have expired, going to refresh their tokens`)
            const malRes = await refreshAccessToken(user.refreshToken)
            updateUserTokens(db, user.id, {
                tokenExpires: getSqlTimestampFromNow(malRes.expires_in),
                accessToken: malRes.access_token,
                refreshToken: malRes.refresh_token,
            })
        }

        return (mediaType === 'anime')
            ? await fetchMalAnimeList(db, user, ITEMS_PER_LIST_REQUEST, offset)
            : await fetchMalMangaList(db, user, ITEMS_PER_LIST_REQUEST, offset)
    } catch (err) {
        if (!(err instanceof Error)) {
            throw err
        }

        if (!err.message.includes('401')) {
            throw err
        }

        logger.info(`Deleting ${stringifyUser(user)} because they have revoked their authorization`)
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
            const db = await initDb(logger)
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
