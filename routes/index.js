'use strict'

const express = require('express');
const router = express.Router();

router.get('/', function(request, response, next) {
    response.render('index', { title: 'MyAnimeList Cover CSS Generator' });
});

module.exports = router;
