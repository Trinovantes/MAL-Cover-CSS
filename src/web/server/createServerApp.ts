import assert from 'assert'
import * as Sentry from '@sentry/node'
import { Integrations } from '@sentry/tracing'
import connectRedis from 'connect-redis'
import express from 'express'
import session from 'express-session'
import createHttpError from 'http-errors'
import memoryStore from 'memorystore'
import morgan from 'morgan'
import { createClient } from 'redis'
import { COOKIE_DURATION, SENTRY_DSN } from '@/common/Constants'
import { getRuntimeSecret, RuntimeSecret } from '@/common/utils/RuntimeSecret'
import { debugInfo } from './middleware/dev'
import { setUserInLocals } from './middleware/user'
import { oauthRouter } from './routers/oauthRouter'
import { settingsRouter } from './routers/settingsRouter'
import { vueRouter } from './routers/vueRouter'
import { setupRouterErrorHandler } from './utils/setupRouterErrorHandler'
import type { Express } from 'express'

type ServerAppOptions = {
    trustProxy: boolean
    useMemoryStorage: boolean
    enableStaticFiles: boolean
    enableSentry: boolean
    enableLogging: boolean
    enableSessions: boolean
}

export async function createServerApp(options: ServerAppOptions): Promise<Express> {
    const app = express()

    // Express sits behind nginx proxy in production
    const { trustProxy } = options
    console.info(`Setting 'trust proxy':${trustProxy}`)
    app.set('trust proxy', trustProxy)

    // Handle non-GET request bodies
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    // -----------------------------------------------------------------------------
    // Optional Middlewares
    // -----------------------------------------------------------------------------

    if (options.enableStaticFiles) {
        assert(DEFINE.PUBLIC_PATH)
        assert(DEFINE.CLIENT_DIST_DIR)
        assert(DEFINE.SERVER_DIST_DIR)

        console.info(`Serving static files from ${DEFINE.CLIENT_DIST_DIR} to ${DEFINE.PUBLIC_PATH}`)
        app.use(DEFINE.PUBLIC_PATH, express.static(DEFINE.CLIENT_DIST_DIR))

        console.info(`Serving static files from ${DEFINE.SERVER_DIST_DIR} to /`)
        app.use('/', express.static(DEFINE.SERVER_DIST_DIR))
    }

    if (options.enableSentry) {
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
            enabled: true,
        })

        // RequestHandler creates a separate execution context using domains, so that every transaction/span/breadcrumb is attached to its own Hub instance
        app.use(Sentry.Handlers.requestHandler())

        // TracingHandler creates a trace for every incoming request
        app.use(Sentry.Handlers.tracingHandler())
    }

    if (options.enableLogging) {
        app.use(morgan(DEFINE.IS_DEV ? 'dev' : 'combined'))
    }

    if (options.enableSessions) {
        const sslEnabled = DEFINE.APP_URL.startsWith('https')
        const redisHost = getRuntimeSecret(RuntimeSecret.REDIS_HOST)
        const redisPort = parseInt(getRuntimeSecret(RuntimeSecret.REDIS_PORT))
        console.info(`Starting express-session secure:${sslEnabled} useMemoryStorage:${options.useMemoryStorage} REDIS_HOST:${redisHost} REDIS_PORT:${redisPort}`)

        let sessionStore: session.Store
        if (options.useMemoryStorage) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const MemoryStore = memoryStore(session)
            sessionStore = new MemoryStore({})
        } else {
            const redisClient = createClient({
                legacyMode: true,
                socket: {
                    host: redisHost,
                    port: redisPort,
                },
            })

            await redisClient.connect()

            // eslint-disable-next-line @typescript-eslint/naming-convention
            const RedisStore = connectRedis(session)
            sessionStore = new RedisStore({ client: redisClient })
        }

        app.use(session({
            secret: getRuntimeSecret(RuntimeSecret.ENCRYPTION_KEY),
            resave: false,
            saveUninitialized: false,
            proxy: trustProxy,
            cookie: {
                maxAge: COOKIE_DURATION,
                httpOnly: true, // Cookies will not be available to Document.cookie api
                secure: sslEnabled, // Cookies only sent over https
            },
            store: sessionStore,
        }))
    }

    // -----------------------------------------------------------------------------
    // Request Handlers
    // -----------------------------------------------------------------------------

    app.use('/api/oauth', debugInfo, setUserInLocals, setupRouterErrorHandler(oauthRouter, true))
    app.use('/api/settings', debugInfo, setUserInLocals, setupRouterErrorHandler(settingsRouter, true))
    app.use('/api', (req, res, next) => {
        next(new createHttpError.NotFound())
    })

    app.use('*', setupRouterErrorHandler(vueRouter, false))

    return app
}
