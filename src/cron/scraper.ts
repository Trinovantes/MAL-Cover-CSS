// eslint-disable-next-line import/order
import '@/common/utils/setupDayjs'

import * as Sentry from '@sentry/node'
import '@sentry/tracing'
import dayjs from 'dayjs'
import { SENTRY_DSN, DELAY_BETWEEN_SCRAPPING, DELAY_BETWEEN_REQUESTS, ITEMS_PER_LIST_REQUEST } from '@/common/Constants'
import { migrateDb } from '@/common/db/migration'
import { MediaType, Item } from '@/common/models/Item'
import { User } from '@/common/models/User'
import { fetchMalAnimeList, fetchMalMangaList } from '@/common/services/MyAnimeList/data'
import { getSqlTimestamp } from '@/common/utils/getSqlTimestamp'
import { sleep } from '@/common/utils/sleep'
import type { AxiosRequestConfig } from 'axios'

// ----------------------------------------------------------------------------
// Sentry
// ----------------------------------------------------------------------------

Sentry.init({
    dsn: SENTRY_DSN,
    release: DEFINE.GIT_HASH,
    tracesSampleRate: 1.0,
    enabled: !DEFINE.IS_DEV,
})

// ----------------------------------------------------------------------------
// Scraper
// ----------------------------------------------------------------------------

async function scrapeUsers() {
    const transaction = Sentry.startTransaction({
        op: 'scrapeUsers',
        name: 'Scrape Users Cron Job',
    })

    const staleUserTime = dayjs.utc().subtract(DELAY_BETWEEN_SCRAPPING, 'hours')
    const staleUserTimestamp = getSqlTimestamp(staleUserTime.toDate())
    console.info(`Getting users lastChecked before ${staleUserTimestamp}`)

    const users = await User.fetchAllToScrape(staleUserTimestamp)
    console.info(`Found ${users.length} users to scrape`)

    for (const user of users) {
        console.info(`Scraping ${user.toString()}`)

        for (const mediaType of Object.values(MediaType)) {
            try {
                const child = transaction.startChild({ op: 'scrapeUser', description: `scrapeUser(${user.toString()}, ${mediaType})` })
                await scrapeUser(user, mediaType)
                await user.updateLastChecked(getSqlTimestamp())
                child.finish()
            } catch (err) {
                console.warn(`Failed to scrapeUser ${user.toString()}`)
                console.warn(err)
                Sentry.captureException(err)
            }

            await sleep(DELAY_BETWEEN_REQUESTS)
        }
    }

    transaction.finish()
}

async function scrapeUser(user: User, mediaType: MediaType, offset = 0) {
    if (!user.accessToken || !user.refreshToken) {
        console.info(`Skipping ${user.toString()} due to missing accessToken or refreshToken`)
        return
    }

    const config: AxiosRequestConfig = {
        params: {
            limit: ITEMS_PER_LIST_REQUEST,
            offset,
        },
    }

    const malList = (mediaType === MediaType.Anime)
        ? await fetchMalAnimeList(user, config)
        : await fetchMalMangaList(user, config)

    for (const malItem of malList?.data ?? []) {
        const malId = malItem.node.id
        const imgUrl = malItem.node.main_picture?.medium ?? null

        await Item.upsert({
            mediaType,
            malId,
            imgUrl,
        })
    }

    if (malList?.paging.next) {
        await scrapeUser(user, mediaType, offset + ITEMS_PER_LIST_REQUEST)
    }
}

// ----------------------------------------------------------------------------
// Clean up
// ----------------------------------------------------------------------------

async function deleteUsers() {
    const users = await User.fetchAllToDelete()
    console.info(`Found ${users.length} users to delete`)

    for (const user of users) {
        console.info(`Deleting ${user.toString()}`)
        await user.destroy()
    }
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main(): Promise<void> {
    await migrateDb()
    await scrapeUsers()
    await deleteUsers()
}

main().catch((err) => {
    console.warn(err)
    Sentry.captureException(err)
    process.exit(1)
})
