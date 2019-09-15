'use strict';

const express = require('express');
const router = express.Router();
const MALCoverCSSDB = require('src/models/MALCoverCSSDB');

router.post('/', function(request, response, next) {

    // Check for nullness
    let username = request.body.username;
    if (typeof username === 'undefined') {
        response.status(400).send('No username provided');
        return;
    }

    // Check for valid username
    username = String(username).trim();
    if (username.match('^(?=.{2,16}$)[a-zA-Z0-9-_]+$') === null) {
        response.status(400).send('Please enter a valid username');
        return;
    }

    let dbmgr = MALCoverCSSDB.connect();
    dbmgr.registerUser(username, function(result) {
        response.status(result.statusCode).send(result.message);
    });

});

module.exports = router;
