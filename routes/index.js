'use strict'

const Config = require('config');
let express = require('express');
let router = express.Router();


router.get('/', function(request, response, next) {
    response.render('index', { title: 'MyAnimeList Cover CSS Generator' });
});

module.exports = router;
