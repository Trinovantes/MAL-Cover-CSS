'use strict'

const Config = require('config');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const router = express.Router();
const logger = require("winston-color");

router.post('/', function(request, response, next) {
    let username = request.body.username;

    if (typeof username === 'undefined') {
        response.status(400).json({
            error: "No username provided"
        });
        return;
    }

    MongoClient.connect(Config.getMongoDbURL(), function(dbError, db) {
        if (dbError) {
            logger.error(dbError);
            response.status(500).json({
                error: "Database error"
            });
            return;
        }

        const user = {
            _id: username,
            lastScraped: null,
            created: Date.now(),
        };

        db.collection(Config.USERS_COLLECTION).insert(user, function(error, result) {
            db.close();

            if (error) {
                let statusCode = 500;
                let message = 'Failed to save user to database';

                switch (error.code) {
                    case 11000:
                    case 11001:
                        statusCode = 400;
                        message = "User '" + username + "' is already in database";
                        break;
                }

                logger.warn(message);
                response.status(statusCode).json({
                    error: message
                });
            } else {
                let message = "User '" + username + "' is now scheduled for scraping";

                logger.info(message);
                response.status(200).json({
                    success: message
                });
            }
        });
    });
});

module.exports = router;
