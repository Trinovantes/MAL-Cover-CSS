import connectRedis from 'connect-redis'
import express, { ErrorRequestHandler } from 'express'
import http from 'http'
import morgan from 'morgan'
import { createClient } from 'redis'
import session from 'express-session'
import { getSecret, isHttpsEnabled, Secrets } from '@/common/utils/secrets'
import { COOKIE_DURATION, SENTRY_DSN } from '@/common/Constants'
import { normalizePort } from './utils/normalizePort'
import { setUserInLocals } from './middleware/user'
import { debugInfo } from './middleware/dev'
import createHttpError, { HttpError } from 'http-errors'
import { oauthRouter } from './routers/oauthRouter'
import { settingsRouter } from './routers/settingsRouter'
import { ErrorResponse } from '@/common/schemas/ApiResponse'
import axios from 'axios'
import * as Sentry from '@sentry/node'
import { Integrations } from '@sentry/tracing'
import '@/common/utils/setupDayjs'

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
            new Integrations.Express({
                // To trace all requests to the default router
                app,
                // Alternatively, you can specify the routes you want to trace:
                // router: someRouter,
            }),
        ],

        // We recommend adjusting this value in production, or using tracesSampler for finer control
        tracesSampleRate: 1.0,
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
    console.info(`Setting session secure:${isHttpsEnabled()} REDIS_HOST:${getSecret(Secrets.REDIS_HOST)} REDIS_PORT:${getSecret(Secrets.REDIS_PORT)}`)

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const RedisStore = connectRedis(session)
    const redisClient = createClient({
        legacyMode: true,
        socket: {
            host: getSecret(Secrets.REDIS_HOST),
            port: parseInt(getSecret(Secrets.REDIS_PORT)),
        },
    })

    await redisClient.connect()

    app.use(session({
        secret: getSecret(Secrets.ENCRYPTION_KEY),
        resave: false,
        saveUninitialized: false,
        proxy: trustProxy,
        cookie: {
            maxAge: COOKIE_DURATION,
            httpOnly: true, // Cookies will not be available to Document.cookie api
            secure: isHttpsEnabled(), // Cookies only sent over https
        },
        store: new RedisStore({ client: redisClient }),
    }))
}

// -----------------------------------------------------------------------------
// Request Handler
// -----------------------------------------------------------------------------

// Serve API endpoints
function setupApiResponseHandlers() {
    app.use('/api/oauth', debugInfo, setUserInLocals, oauthRouter)
    app.use('/api/settings', debugInfo, setUserInLocals, settingsRouter)
    app.use('/api', (req, res, next) => {
        next(new createHttpError.NotFound())
    })
}

function setupErrorResponseHandlers() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorHander: ErrorRequestHandler = (err, req, res, next) => {
        if (axios.isAxiosError(err)) {
            // Don't log entire Axios err object since it includes req, res
            console.info(err.name, err.message)
        } else if (!(err instanceof HttpError)) {
            // Log unexpected non-HttpErrors
            console.info(err)
        }

        // Set locals, only providing error in development
        const status = err instanceof HttpError ? err.status : 500
        const message = err instanceof HttpError ? err.message : 'Internal Server Error'

        const response: ErrorResponse = {
            errorMessage: message,
        }

        res.status(status)
        res.json(response)
    }

    app.use(Sentry.Handlers.requestHandler())
    app.use(errorHander)
}

// -----------------------------------------------------------------------------
// HTTP Server
// -----------------------------------------------------------------------------

async function runHttpServer() {
    setupSentry()

    setupBodyParsers()
    setupLogging()
    await setupSession()

    setupApiResponseHandlers()
    setupErrorResponseHandlers()

    const port = normalizePort(process.env.PORT || '3000')
    console.info('Starting HTTP Web Server', `http://localhost:${port}`)
    const server = http.createServer(app)

    server.listen(port, () => {
        console.info(`Server Listening on Port ${port}`)
    })

    server.on('error', (error) => {
        console.warn(error)
    })
}

runHttpServer().catch(console.error)
