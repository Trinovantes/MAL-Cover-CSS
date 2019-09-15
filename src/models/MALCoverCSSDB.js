'use strict';

const Nano = require('nano');
const assert = require('assert');
const sleep = require('src/utils/sleep');
const logger = require('src/utils/logger');
const Config = require('src/utils/config');
const Constants = require('src/utils/constants');

//-----------------------------------------------------------------------------
// DB Setup
//-----------------------------------------------------------------------------

function getOrCreateDatabase(couchDB, dbName) {
    const nano = Nano(couchDB);

    let createMALUsersDesign = function(db) {
        const USERS_DOCTYPE = Constants.MAL_USERS_DESIGN;

        // Need to hardcode this because the map function is saved into the database
        assert(USERS_DOCTYPE === 'mal_users');

        return db.insert({
            views: {
                "byLastScraped": {
                    map: function(doc) {
                        if (doc.docType !== 'mal_users') {
                            return;
                        }

                        emit(doc.lastScraped, {
                            username: doc.username,
                        });
                    }
                }
            }
        }, `_design/${USERS_DOCTYPE}`);
    }

    let createMALItemsDesign = function(db) {
        const ITEMS_DOCTYPE = Constants.MAL_ITEMS_DESIGN;

        // Need to hardcode this because the map function is saved into the database
        assert(ITEMS_DOCTYPE === 'mal_items');

        return db.insert({
            views: {
                "byMediaType": {
                    map: function(doc) {
                        if (doc.docType !== 'mal_items') {
                            return;
                        }

                        emit(doc.mediaType, {
                            malId: doc.malId,
                            imgUrl: doc.imgUrl,
                        });
                    }
                }
            }
        }, `_design/${ITEMS_DOCTYPE}`);
    }

    let createDatabase = function(onCreate) {
        nano.db.create(dbName).then((response) => {
            logger.info('Created "%s" database', dbName);

            let db = nano.use(dbName);
            Promise.all([
                createMALUsersDesign(db),
                createMALItemsDesign(db),
            ]).then(function() {
                onCreate();
            });
        }).catch((error) => {
            if (error.error === 'file_exists') {
                logger.warn('Database "%s" already exists when trying to create it', dbName);
                onCreate();
                return;
            }

            throw error;
        });
    }

    return new Promise(async function (resolve, reject) {
        let dbExist = false;
        let currentlyCreatingDb = false;

        while (!dbExist) {
            if (!currentlyCreatingDb) {
                nano.db.get(dbName).then(function() {
                    dbExist = true;
                }).catch((error) => {
                    if (error.error === 'not_found') {
                        if (!currentlyCreatingDb) {
                            logger.warn('Database "%s" does not exist. Attempting to create it...', dbName);
                            currentlyCreatingDb = true;
                            createDatabase(function() {
                                currentlyCreatingDb = false;
                            });
                        }
                        return;
                    }

                    reject(error);
                });
            }

            await sleep(500);
        }

        logger.info('Connected to database "%s"', dbName);
        resolve(nano.use(dbName));
    });
}

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

function getMALUserId(username) {
    return `${Constants.MAL_USERS_DESIGN}:${username}`;
}

function getMALItemID(mediaType, malId) {
    return `${Constants.MAL_ITEMS_DESIGN}:${mediaType}:${malId}`;
}

function readableDate(unixTime) {
    return new Date(unixTime).toUTCString();
}

//-----------------------------------------------------------------------------
// Interface
//-----------------------------------------------------------------------------

module.exports = {

    connect: function() {
        const dbPromise = getOrCreateDatabase(Config.COUCHDB_CONFIG, Constants.DB_NAME);

        return {

            //-----------------------------------------------------------------
            // Users
            //-----------------------------------------------------------------

            registerUser: function(username, onComplete) {
                dbPromise.then((db) => {
                    let newUser = {
                        docType: Constants.MAL_USERS_DESIGN,
                        _id: getMALUserId(username),

                        username: username,
                        lastScraped: 0,
                        created: Date.now(),
                    };

                    db.insert(newUser).then((response) => {
                        let message = `"${username}" has been registered`;

                        logger.info(message);
                        onComplete({
                            statusCode: 200,
                            message: message,
                        });
                    }).catch((error) => {
                        let statusCode = 500;
                        let message = 'An unknown error has occurred while trying to save to the database';

                        if (error.error === 'conflict') {
                            statusCode = 400;
                            message = `"${username}" is already registered in the database`;
                        }

                        logger.warn(message);
                        onComplete({
                            statusCode: statusCode,
                            message: message,
                        });
                    });
                });
            },

            getUsersToScrape: function(onReceivedResults) {
                dbPromise.then((db) => {
                    let staleUserTime = Date.now() - Constants.DELAY_BETWEEN_SCRAPPING;

                    logger.info('Gettings users lastScraped before %s (%d)', readableDate(staleUserTime), staleUserTime);

                    db.view(Constants.MAL_USERS_DESIGN, "byLastScraped", {
                        "endkey": staleUserTime,
                    }).then((results) => {
                        onReceivedResults(results.rows.map(row => row.value));
                    });
                });
            },

            updateUserLastScraped: function(user, onComplete) {
                let lastScraped = Date.now();
                let id = getMALUserId(user.username);

                logger.info('Updating user "%s" lastScraped to %s (%d)', user.username, readableDate(lastScraped), lastScraped);

                dbPromise.then((db) => {
                    db.get(id).then((user) => {
                        user.lastScraped = lastScraped;
                        db.insert(user).then((response) => {
                            onComplete();
                        });
                    });
                });
            },

            deleteUserIfExists: function(user, onComplete) {
                let id = getMALUserId(user.username);

                logger.warn('Deleting user "%s"', user.username);

                dbPromise.then((db) => {
                    db.get(id).then((user) => {
                        db.destroy(user._id, user._rev).then((response) => {
                            onComplete();
                        });
                    }).catch((error) => {
                        if (error.error === 'not_found') {
                            onComplete();
                            return;
                        }

                        throw error;
                    });
                });
            },

            //-----------------------------------------------------------------
            // Items
            //-----------------------------------------------------------------

            getMALItems: function(mediaType, onReceivedResults) {
                let params = {};
                if (mediaType === 'anime' || mediaType === 'manga') {
                    params.key = mediaType;
                }

                dbPromise.then((db) => {
                    db.view(Constants.MAL_ITEMS_DESIGN, 'byMediaType', params).then((results) => {
                        onReceivedResults(results.rows.map(row => row.value));
                    });
                });
            },

            updateMALItem: function(mediaType, malId, imgUrl, onComplete) {
                dbPromise.then((db) => {
                    let id = getMALItemID(mediaType, malId);

                    db.get(id).then((item) => {
                        item.imgUrl = imgUrl;
                        db.insert(item).then((response) => {
                            onComplete();
                        });
                    }).catch((error) => {
                        if (error.error === 'not_found') {
                            let newItem = {
                                docType: Constants.MAL_ITEMS_DESIGN,
                                _id: id,

                                mediaType: mediaType,
                                malId: malId,
                                imgUrl: imgUrl,
                            };

                            db.insert(newItem).then((response) => {
                                onComplete();
                            });

                            return;
                        }

                        throw error;
                    });
                });
            },

        };
    },

};
