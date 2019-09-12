'use strict'

const createError = require('http-errors');
const express = require('express');
const exphbs  = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// -----------------------------------------------------------------------------
// Views
// -----------------------------------------------------------------------------

const app = express();

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

const less = require('less-middleware');
app.use(less(path.join(__dirname, 'public')));

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const rateLimit = require("express-rate-limit");
app.use('/users', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20 // limit each IP to 20 requests per windowMs
}));

// -----------------------------------------------------------------------------
// Routing
// -----------------------------------------------------------------------------

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'dev' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', { layout: false });
});

module.exports = app;
