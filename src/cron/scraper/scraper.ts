import { AxiosRequestConfig } from 'axios'
import { Op } from 'sequelize'
import dayjs from 'dayjs'

import { fetchMalAnimeList, fetchMalMangaList } from '@common/MyAnimeList'
import { Item, MediaType } from '@common/models/Item'
import { User } from '@common/models/User'
import { sleep } from '@common/utils'
import Constants from '@common/Constants'
import { logger } from '@common/utils/logger'

// ----------------------------------------------------------------------------
// Scraper
// ----------------------------------------------------------------------------

async function scrapeUsers() {
    const staleUserTime = dayjs().subtract(Constants.DELAY_BETWEEN_SCRAPPING, 'hours')
    logger.info(`Getting users lastChecked before ${staleUserTime.toString()}`)

    const users = await User.findAll({
        where: {
            lastChecked: {
                [Op.or]: [
                    null,
                    {
                        [Op.lt]: staleUserTime.toDate(),
                    },
                ],
            },
        },
    })

    logger.info(`Found ${users.length} users to scrape`)
    for (const user of users) {
        for (const mediaType of Object.values(MediaType)) {
            try {
                await scrapeUser(user, mediaType)
                await user.update({ lastChecked: new Date() })
            } catch (err) {
                const error = err as Error
                logger.warn('Failed to scrapeUser %d %s (%s:%s)', user.malUserId, user.username, error.name, error.message)
                logger.debug(error.stack)
            }

            await sleep(Constants.DELAY_BETWEEN_REQUESTS)
        }
    }
}

async function scrapeUser(user: User, mediaType: MediaType, offset = 0) {
    if (!user.accessToken || !user.refreshToken) {
        logger.warn('Skipping to scrapeUser %d due to missing accessToken or refreshToken', user.malUserId)
        return
    }

    const config: AxiosRequestConfig = {
        params: {
            limit: Constants.ITEMS_PER_LIST_REQUEST,
            offset: offset,
        },
    }

    const malList = (mediaType === MediaType.Anime)
        ? await fetchMalAnimeList(user, config)
        : await fetchMalMangaList(user, config)

    for (const malItem of malList.data) {
        const malId = malItem.node.id
        const imgUrl = malItem.node.main_picture.medium

        const [item] = await Item.upsert({
            mediaType: mediaType,
            malId: malId,
        })

        await item.update({ imgUrl })
    }

    if (malList.paging.next) {
        await scrapeUser(user, mediaType, offset + Constants.ITEMS_PER_LIST_REQUEST)
    }
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

export async function main(): Promise<void> {
    await scrapeUsers()
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((err) => {
        logger.error(err)
        process.exit(1)
    })
