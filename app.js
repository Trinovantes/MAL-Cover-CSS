'use strict'

let path = require('path');
let express = require('express');
let app = express();

// -----------------------------------------------------------------------------
// Views
// -----------------------------------------------------------------------------

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layout.hbs' });

let less = require('less-middleware');
let publicDir = path.join(__dirname, 'public');
app.use(less(publicDir));
app.use(express.static(publicDir, { dotfiles: 'allow' }));

// -----------------------------------------------------------------------------
// Other Middleware
// -----------------------------------------------------------------------------

let favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

let logger = require('morgan');
app.use(logger('dev'));

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let cookieParser = require('cookie-parser');
app.use(cookieParser());

let helmet = require('helmet');
app.use(helmet());

// -----------------------------------------------------------------------------
// Routing
// -----------------------------------------------------------------------------

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// After all routes failed to match, default to 404
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// -----------------------------------------------------------------------------
// Error handlers
// -----------------------------------------------------------------------------

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: ((app.get('env') === 'development') ? err : {}),
    });
});

module.exports = app;
