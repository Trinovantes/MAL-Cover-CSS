// eslint-disable-next-line import/order
import '@/common/utils/setupDayjs'

import assert from 'assert'
import http from 'http'
import path from 'path'
import * as Sentry from '@sentry/node'
import { Integrations } from '@sentry/tracing'
import connectRedis from 'connect-redis'
import express from 'express'
import session from 'express-session'
import createHttpError from 'http-errors'
import morgan from 'morgan'
import { createClient } from 'redis'
import { COOKIE_DURATION, SENTRY_DSN } from '@/common/Constants'
import { getSecret, RuntimeSecret } from '@/common/utils/RuntimeSecret'
import { debugInfo } from './server/middleware/dev'
import { setUserInLocals } from './server/middleware/user'
import { oauthRouter } from './server/routers/oauthRouter'
import { settingsRouter } from './server/routers/settingsRouter'
import { vueRouter } from './server/routers/vueRouter'
import { setupRouterErrorHandler } from './server/utils/setupRouterErrorHandler'

// -----------------------------------------------------------------------------
// Express
// -----------------------------------------------------------------------------

const app = express()

// Express sits behind nginx proxy in production
const trustProxy = !DEFINE.IS_DEV
console.info(`Setting trust proxy:${trustProxy}`)
app.set('trust proxy', trustProxy)

// -----------------------------------------------------------------------------
// Sentry
// -----------------------------------------------------------------------------

function setupSentry() {
    Sentry.init({
        dsn: SENTRY_DSN,
        release: DEFINE.GIT_HASH,
        integrations: [
            // Enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),

            // Enable Express.js middleware tracing
            new Integrations.Express({ app }),
        ],

        // We recommend adjusting this value in production, or using tracesSampler for finer control
        tracesSampleRate: 1,
        enabled: !DEFINE.IS_DEV,
    })

    // RequestHandler creates a separate execution context using domains, so that every transaction/span/breadcrumb is attached to its own Hub instance
    app.use(Sentry.Handlers.requestHandler())

    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler())
}

// -----------------------------------------------------------------------------
// Middlewares
// -----------------------------------------------------------------------------

// Handle non-GET request bodies
function setupBodyParsers() {
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
}

function setupLogging() {
    // Logging
    app.use(morgan(DEFINE.IS_DEV ? 'dev' : 'combined'))
}

async function setupSession() {
    const sslEnabled = DEFINE.APP_URL.startsWith('https')
    console.info(`Starting express-session secure:${sslEnabled} REDIS_HOST:${getSecret(RuntimeSecret.REDIS_HOST)} REDIS_PORT:${getSecret(RuntimeSecret.REDIS_PORT)}`)

    const redisClient = createClient({
        legacyMode: true,
        socket: {
            host: getSecret(RuntimeSecret.REDIS_HOST),
            port: parseInt(getSecret(RuntimeSecret.REDIS_PORT)),
        },
    })

    await redisClient.connect()

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const RedisStore = connectRedis(session)
    const redisStore = new RedisStore({ client: redisClient })

    app.use(session({
        secret: getSecret(RuntimeSecret.ENCRYPTION_KEY),
        resave: false,
        saveUninitialized: false,
        proxy: trustProxy,
        cookie: {
            maxAge: COOKIE_DURATION,
            httpOnly: true, // Cookies will not be available to Document.cookie api
            secure: sslEnabled, // Cookies only sent over https
        },
        store: redisStore,
    }))
}

// -----------------------------------------------------------------------------
// Request Handler
// -----------------------------------------------------------------------------

function setupStaticHandlers() {
    if (!DEFINE.IS_DEV) {
        return
    }

    assert(DEFINE.PUBLIC_PATH)
    assert(DEFINE.CLIENT_DIST_DIR)

    app.use('/favicon.png', express.static(path.join(DEFINE.CLIENT_DIST_DIR, 'favicon.png')))
    app.use(DEFINE.PUBLIC_PATH, express.static(DEFINE.CLIENT_DIST_DIR))
}

function setupResponseHandlers() {
    app.use('/api/oauth', debugInfo, setUserInLocals, setupRouterErrorHandler(oauthRouter))
    app.use('/api/settings', debugInfo, setUserInLocals, setupRouterErrorHandler(settingsRouter))
    app.use('/api', (req, res, next) => {
        next(new createHttpError.NotFound())
    })

    app.use('*', setupRouterErrorHandler(vueRouter, false))
}

// -----------------------------------------------------------------------------
// HTTP Server
// -----------------------------------------------------------------------------

async function runHttpServer() {
    setupSentry()
    setupStaticHandlers()

    setupBodyParsers()
    setupLogging()
    await setupSession()

    setupResponseHandlers()

    const port = parseInt(DEFINE.APP_PORT ?? '3000')
    const server = http.createServer(app)

    console.info('Starting HTTP Server')
    server.listen(port, '0.0.0.0', (): void => {
        console.info('Server Ready', server.address())
    })

    server.on('error', (error) => {
        console.warn('Server Error', error)
    })
}

runHttpServer().catch(console.error)
