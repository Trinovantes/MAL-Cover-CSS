import ConnectRedis from 'connect-redis'
import express, { ErrorRequestHandler } from 'express'
import http from 'http'
import morgan from 'morgan'
import redis from 'redis'
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

// -----------------------------------------------------------------------------
// Express
// -----------------------------------------------------------------------------

const app = express()

// -----------------------------------------------------------------------------
// Sentry
// -----------------------------------------------------------------------------

Sentry.init({
    dsn: SENTRY_DSN,
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

// -----------------------------------------------------------------------------
// Middlewars
// -----------------------------------------------------------------------------

// Handle non-GET request bodies
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Logging
app.use(morgan(DEFINE.IS_DEV ? 'dev' : 'combined'))

// Express sits behind nginx proxy in production
app.set('trust proxy', !DEFINE.IS_DEV)

// Sessions
app.use(session({
    secret: getSecret(Secrets.ENCRYPTION_KEY),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: COOKIE_DURATION,
        httpOnly: true, // Cookies will not be available to Document.cookie api
        secure: isHttpsEnabled(), // Cookies only sent over https
    },
    store: (() => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const RedisStore = ConnectRedis(session)
        const redisClient = redis.createClient({
            host: getSecret(Secrets.REDIS_HOST),
            port: parseInt(getSecret(Secrets.REDIS_PORT)),
        })
        return new RedisStore({ client: redisClient })
    })(),
}))

// -----------------------------------------------------------------------------
// Request Handler
// -----------------------------------------------------------------------------

// Serve API endpoints
app.use('/api/oauth', debugInfo, setUserInLocals, oauthRouter)
app.use('/api/settings', debugInfo, setUserInLocals, settingsRouter)
app.use('/api', (req, res, next) => {
    next(new createHttpError.NotFound())
})

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

// -----------------------------------------------------------------------------
// HTTP Server
// -----------------------------------------------------------------------------

function runHttpServer() {
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

runHttpServer()
