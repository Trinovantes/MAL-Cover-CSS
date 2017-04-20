'use strict'

const Config = require('config');
const MongoClient = require('mongodb').MongoClient;

const request = require("request");
const XML = require('pixl-xml');
const vasync = require('vasync');
const logger = require("winston-color");

//-----------------------------------------------------------------------------
// Scraper
//-----------------------------------------------------------------------------

module.exports = function scrapeUsers(onComplete) {
    logger.info('Starting to scrape users');
    MongoClient.connect(Config.getMongoDbURL(), function(dbError, db) {
        if (dbError) {
            logger.error('Failed to connect to database', dbError);
            onComplete();
            return;
        }

        let cursor = db.collection(Config.USERS_COLLECTION).find({
            $or: [
                { lastScraped: null },                                          // Never scraped
                { lastScraped: { $lte : Date.now() - Config.SCRAPING_DELAY } }, // Over x days ago
                { _id: 'trinovantes' }, // For debugging
            ]
        });

        let barrier = vasync.barrier();
        barrier.on('drain', function() {
            if (cursor.isClosed()) {
                logger.info('Finished scraping users');
                db.close();
                onComplete();
            }
        });

        cursor.count(function(error, count) {
            if (error) {
                logger.error(error);
                return;
            }

            logger.info('Found %d users to scrape', count);

            if (count === 0) {
                barrier.start('dummy');
                barrier.done('dummy');
                return;
            }

            cursor.forEach(function(user) {
                const username = user._id;
                const barrierKey = 'update user:' + username;
                barrier.start(barrierKey);

                scrapeUser(db, barrier, username, 'anime');
                scrapeUser(db, barrier, username, 'manga');

                db.collection(Config.USERS_COLLECTION).update({
                    _id: user._id
                }, {
                    $set: {
                        lastScraped: Date.now()
                    }
                }, function(error, results) {
                    if (error) {
                        logger.error(error);
                    }
                    barrier.done(barrierKey);
                });
            });
        });
    });
}

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

function scrapeUser(db, barrier, username, type) {
    const barrierKey = 'scrape:' + username + ':' + type;
    const url = 'https://myanimelist.net/malappinfo.php?status=all'
                    + '&u=' + username
                    + '&type=' + type;
    const options = {
        url: url,
        headers: {
            'User-Agent': Config.USER_AGENT,
        },
    };

    logger.info('Fetching %s', url);
    barrier.start(barrierKey);
    request(options, function(error, response, body) {
        if (error) {
            logger.error('Failed to scrape user %s : %s', username, error);
            barrier.done(barrierKey);
            return;
        }

        let doc = XML.parse(body);

        if (typeof doc.myinfo === 'undefined') {
            logger.warn('User %s does not exist on MyAnimeList.net', username);
            logger.warn('Deleting %s from database', username);

            db.collection(Config.USERS_COLLECTION).deleteOne({
                _id: username
            }, function(error, results) {
                barrier.done(barrierKey);
            });
            return;
        }

        let items = doc[type] || [];
        for (let item of items) {
            const malId = item['series_' + type + 'db_id'];
            const imgUrl = item['series_image'];
            const itemBarrierKey = 'update mal item:' + type + ':' + malId;

            barrier.start(itemBarrierKey);
            db.collection(Config.MAL_ITEMS_COLLECTION).update({
                malId: malId,
                type: type,
            }, {
                $set: {
                    imgUrl: imgUrl,
                }
            }, {
                upsert: true
            }, function(error, result) {
                logger.info('Saved', type, malId, imgUrl);
                barrier.done(itemBarrierKey);
            });
        }

        barrier.done(barrierKey);
    });
}
