'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/', function(request, response, next) {

    let getFileContents = function(fileName) {
        let rawsDir = path.join(__dirname, '..', 'views', 'raw');
        return fs.readFileSync(path.join(rawsDir, fileName));
    }

    let range = function(start, end) {
        let a = [];
        for (let i = start; i <= end; i++) {
            a.push(i);
        }
        return a;
    }

    response.render('index', {
        title: 'MyAnimeList.net Cover Image CSS Generator',
        generatedStylesheets: {
            code: getFileContents('generatedStylesheets.css'),
            comments: [1, 6, 12].concat(range(18, 25)),
            highlights: [],
        },
        exampleUsage: {
            code: getFileContents('exampleUsage.css'),
            comments: [],
            highlights: [1, 18],
        },
        exampleEntry: {
            code: getFileContents('exampleEntry.html'),
            comments: [40, 42],
            highlights: [12, 41],
        },
    });

});

module.exports = router;
