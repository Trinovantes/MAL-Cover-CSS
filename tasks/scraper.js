'use strict'

const Config = require('../config');
let MongoClient = require('mongodb').MongoClient;
let request = require("request");
let XML = require('pixl-xml');
let vasync = require('vasync');


module.exports = function scrapeUsers(onComplete) {
    console.info('Starting to scrape users');

    MongoClient.connect(Config.getMongoDbURL(), function(dbError, db) {
        if (dbError) {
            console.error('Failed to connect to database', dbError);
            onComplete();
            return;
        }

        let barrier = vasync.barrier();
        barrier.on('drain', function() {
            console.info('Finished scraping users');
            db.close();
            onComplete();
        });

        findUsersToScrape(db, barrier, scapeUser);
    });
}

function findUsersToScrape(db, barrier, onUserToScrape) {
    let cursor = db.collection(Config.USERS_COLLECTION).find({
        $or: [
            { lastScraped: null },                                          // Never scraped
            { lastScraped: { $lte : Date.now() - Config.SCRAPING_DELAY } }, // Over x days ago
            { _id: 'trinovantes' }, // For debugging
        ]
    });

    cursor.count(function(error, count) {
        console.info('Found', count, 'users to scrape');

        if (count === 0) {
            barrier.start('dummy');
            barrier.done('dummy');
            return;
        }

        cursor.forEach(function(user) {
            const username = user._id;
            const barrierKey = 'update user:' + username;
            barrier.start(barrierKey);

            onUserToScrape(db, barrier, username, 'anime');
            onUserToScrape(db, barrier, username, 'manga');

            db.collection(Config.USERS_COLLECTION).update({
                _id: user._id 
            }, {
                $set: {
                    lastScraped: Date.now()
                }
            }, function(error, results) {
                barrier.done(barrierKey);
            });
        });
    });
}

function scapeUser(db, barrier, username, type) {
    const barrierKey = 'scrape:' + username + ':' + type;
    const url = 'http://myanimelist.net/malappinfo.php?status=all'
                    + '&u=' + username
                    + '&type=' + type;
    const options = {
        url: url,
        headers: {
            'User-Agent': Config.USER_AGENT,
        },
    };

    console.info('Fetching', url);
    barrier.start(barrierKey);
    request(options, function(error, response, body) {
        if (error) {
            console.error('Failed to scrape user', username, error);
            barrier.done(barrierKey);
            return;
        }

        let doc = XML.parse(body);

        if (typeof doc.myinfo === 'undefined') {
            console.error('User', username, 'does not exist on MyAnimeList.net');
            console.warn('Deleting', username, 'from database');

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
                console.info('Saved', type, malId, imgUrl);
                barrier.done(itemBarrierKey);
            });
        }

        barrier.done(barrierKey);
    });
}
