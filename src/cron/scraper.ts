/* eslint-disable no-unreachable-loop */
import { Item, MediaType } from '@/api/models/Item'
import { User } from '@/api/models/User'
import { getSqlTimestamp } from '@/api/utils/getSqlTimestamp'
import { DELAY_BETWEEN_REQUESTS, DELAY_BETWEEN_SCRAPPING, ITEMS_PER_LIST_REQUEST } from '@/common/Constants'
import { fetchMalAnimeList, fetchMalMangaList } from '@/common/MyAnimeList/data'
import { sleep } from '@/common/utils/sleep'
import { AxiosRequestConfig } from 'axios'
import dayjs from 'dayjs'

// ----------------------------------------------------------------------------
// Scraper
// ----------------------------------------------------------------------------

async function scrapeUsers() {
    const staleUserTime = dayjs().subtract(DELAY_BETWEEN_SCRAPPING, 'hours')
    console.info(`Getting users lastChecked before ${getSqlTimestamp(staleUserTime.toDate())}`)

    const users = await User.fetchAllToScrape(staleUserTime.toDate())
    console.info(`Found ${users.length} users to scrape`)

    for (const user of users) {
        for (const mediaType of Object.values(MediaType)) {
            try {
                console.info(`Scraping ${user.toString()}`)
                await scrapeUser(user, mediaType)
                await user.updateLastChecked(getSqlTimestamp())
            } catch (err) {
                console.warn(`Failed to scrapeUser ${user.toString()}`)
                console.warn(err)
            }

            await sleep(DELAY_BETWEEN_REQUESTS)
        }
    }
}

async function scrapeUser(user: User, mediaType: MediaType, offset = 0) {
    if (!user.accessToken || !user.refreshToken) {
        console.info(`Skipping ${user.toString()} due to missing accessToken or refreshToken`)
        return
    }

    const config: AxiosRequestConfig = {
        params: {
            limit: ITEMS_PER_LIST_REQUEST,
            offset: offset,
        },
    }

    const malList = (mediaType === MediaType.Anime)
        ? await fetchMalAnimeList(user, config)
        : await fetchMalMangaList(user, config)

    for (const malItem of malList?.data ?? []) {
        const malId = malItem.node.id
        const imgUrl = malItem.node.main_picture?.medium ?? null

        await Item.upsert({
            mediaType: mediaType,
            malId: malId,
            imgUrl: imgUrl,
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

export async function main(): Promise<void> {
    await scrapeUsers()
    await deleteUsers()
}

main().catch((err) => {
    console.warn(err)
    process.exit(1)
})
