'use strict'

const Config = require('config');
let express = require('express');
let router = express.Router();
let MongoClient = require('mongodb').MongoClient;


router.post('/', function(request, response, next) {
    let username = request.body.username;
    
    if (typeof username === 'undefined') {
        response.status(400).json({
            error: 'No username provided'
        });
        return;
    }

    MongoClient.connect(Config.getMongoDbURL(), function(dbError, db) {
        if (dbError) {
            console.error(dbError);
            response.status(500).json({
                error: 'Database error'
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

            let statusCode = 200;
            let message = 'User ' + username + ' is now scheduled for scraping';

            if (error) {
                switch (error.code) {
                    case 11000:
                    case 11001:
                        statusCode = 400;
                        message = 'User ' + username + ' is already in database';
                        break;
                    default:
                        console.error(error); // Unhandled exception
                        statusCode = 500;
                        message = 'Failed to save user to database';
                }
            }

            console.info(message);
            response.status(statusCode).json({
                success: message
            });
        });
    });
});

module.exports = router;
