'use strict';

const request = require("request");
const vasync = require('vasync');

const logger = require('src/utils/logger');
const sleep = require('src/utils/sleep');
const Constants = require('src/utils/constants');
const MALCoverCSSDB = require('src/models/MALCoverCSSDB');

//-----------------------------------------------------------------------------
// Scraper
//-----------------------------------------------------------------------------

module.exports = function scrapeUsers(onComplete) {
    logger.header('Starting to scrape users');
    let dbmgr = MALCoverCSSDB.connect();

    let jobBarrier = vasync.barrier();
    jobBarrier.on('drain', function() {
        logger.info('Finished scraping users');
        onComplete();
    });

    dbmgr.getUsersToScrape(async (users) => {
        logger.info('Found %d users to scrape', users.length);

        if (users.length === 0) {
            jobBarrier.start('dummy');
            jobBarrier.done('dummy');
            return;
        }

        for (let user of users) {
            let userIsValid = true;
            const username = user.username;

            let barrierKey = `update ${username}`;
            jobBarrier.start(barrierKey);

            let userBarrier = vasync.barrier();
            userBarrier.on('drain', function() {
                if (userIsValid) {
                    dbmgr.updateUserLastScraped(user, () => {
                        jobBarrier.done(barrierKey);
                    });
                } else {
                    jobBarrier.done(barrierKey);
                }
            });

            let userBarrierKey = 'this ensures all the barriers inside scrapeUser has started before userBarrier can drain';
            userBarrier.start(userBarrierKey);

            scrapeUser(dbmgr, userBarrier, user, 'anime', () => { userIsValid = false; });
            await sleep(1000);

            scrapeUser(dbmgr, userBarrier, user, 'manga', () => { userIsValid = false; });
            await sleep(1000);

            userBarrier.done(userBarrierKey);
        }
    });
}

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

function scrapeUser(dbmgr, barrier, user, mediaType, onDeleteUser, pageNum = 1) {
    const username = user.username;
    const barrierKey = `scrape:${username}:${mediaType}:${pageNum}`;
    const url = `https://api.jikan.moe/v3/user/${username}/${mediaType}list/all/${pageNum}`;

    const options = {
        url: url,
    };

    logger.info('Fetching %s', url);
    barrier.start(barrierKey);

    request(options, function(error, response, body) {
        switch (response.statusCode) {
            case 400: {
                logger.warn('[%s] User %s does not exist on MyAnimeList.net', mediaType, username);

                dbmgr.deleteUserIfExists(user, () => {
                    onDeleteUser();
                    barrier.done(barrierKey);
                });

                break;
            }
            case 200: {
                let info = JSON.parse(body);
                let items = info[mediaType];
                logger.info('[%s] Scraped %d items from "%s"', mediaType, items.length, username)

                for (let item of items) {
                    const malId = item['mal_id'];
                    const imgUrl = item['image_url'];
                    const itemBarrierKey = `update mal item:${mediaType}:${malId}`;

                    barrier.start(itemBarrierKey);
                    dbmgr.updateMALItem(mediaType, malId, imgUrl, () => {
                        barrier.done(itemBarrierKey);
                    });
                }

                if (items.length == Constants.MAX_ITEMS_PER_PAGE) {
                    // If this page contains max num items, there might be another page
                    scrapeUser(dbmgr, barrier, user, mediaType, onDeleteUser, pageNum + 1);
                }

                barrier.done(barrierKey);
                break;
            }
            default: {
                logger.error('[%s] Unknown failure when trying to scrape user %s : %s', mediaType, username, error);
                barrier.done(barrierKey);
            }
        }
    });
}
