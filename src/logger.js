'use strict'

const winston = require('winston');

let logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level}] ${message}`;
        }),
    ),
    transports: [
        new winston.transports.Console({
            colorize: true,
            json: false,
            handleExceptions: true,
            level: 'debug',
        })
    ],
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    },
};

logger.bar = function() {
    logger.info('='.repeat(80));
}

logger.header = function() {
    logger.info('-'.repeat(60));
    logger.info.apply(null, arguments);
    logger.info('-'.repeat(60));
}

module.exports = logger;
