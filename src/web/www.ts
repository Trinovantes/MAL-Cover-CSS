import ConnectRedis from 'connect-redis'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import redis from 'redis'
import session from 'express-session'

import { normalizePort } from '@common/utils'
import { debugInfo } from '@web/api/middleware/dev'
import { setUserInLocals } from './api/middleware/user'
import { apiRouter } from '@api/expressRouter'
import { createViewRouter } from '@web/expressRouter'
import { logger } from '@common/utils/logger'

// ----------------------------------------------------------------------------
// ENV
// ----------------------------------------------------------------------------

const publicPath = DEFINE.PUBLIC_PATH
const staticDir = DEFINE.STATIC_DIR
const serverDir = DEFINE.SERVER_DIR
const clientDir = DEFINE.CLIENT_DIR

if (!publicPath || !staticDir || !serverDir || !clientDir) {
    throw new Error('Missing DEFINES')
}

// -----------------------------------------------------------------------------
// Express
// -----------------------------------------------------------------------------

const app = express()

// Handle non-GET request bodies
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Logging
app.use(morgan(DEFINE.IS_DEV ? 'dev' : 'combined'))

// Set up sessions
app.use(session({
    secret: process.env.ENCRYPTION_KEY || '',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Cookies will not be available to Document.cookie api
        secure: !DEFINE.IS_DEV, // Cookies only sent over https
    },
    store: (() => {
        const RedisStore = ConnectRedis(session)
        const redisClient = redis.createClient()
        return new RedisStore({ client: redisClient })
    })(),
}))

// -----------------------------------------------------------------------------
// Static Handlers
// -----------------------------------------------------------------------------

// Serves unprocessed files in /static dir
app.use(express.static(staticDir))

// Serves webpack generated assets (js/css/img)
app.use(publicPath, express.static(clientDir))

// -----------------------------------------------------------------------------
// HTTP Server
// -----------------------------------------------------------------------------

async function runHttpServer() {
    const port = normalizePort(process.env.PORT || '8080')
    const server = http.createServer(app)

    logger.info('Setting up Handlers')
    app.use('/api', setUserInLocals, debugInfo, apiRouter)
    app.use('*', debugInfo, await createViewRouter(app))

    logger.info('Starting HTTP Web Server')
    server.listen(port, () => {
        logger.info('Server Listening %d', port)
    })
}

void runHttpServer()
