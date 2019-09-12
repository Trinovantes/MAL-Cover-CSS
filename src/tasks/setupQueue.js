'use strict'

const Queue = require('bull');
const logger = require('src/logger');
const Config = require('src/config');

function setupQueue(queueName, onProcess) {
    logger.info('Queuing %s jobs repeating every "%s"', queueName, Config.JOB_REPEAT_DELAY);

    let queueOptions = {
        repeat: { cron: Config.JOB_REPEAT_DELAY },
        removeOnComplete: true,
        attempts: 3,
        backoff: 3,
    };

    let q = new Queue(queueName, { redis: Config.REDIS_CONFIG });

    Promise.all([
        q.clean(0, 'completed'),
        q.clean(0, 'wait'),
        q.clean(0, 'active'),
        q.clean(0, 'delayed'),
        q.clean(0, 'failed'),
    ]).then(function() {
        q.process(onProcess);
        q.add({}, queueOptions);
    });
}

module.exports = setupQueue;
