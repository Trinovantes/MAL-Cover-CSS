import cors from 'cors'
import express from 'express'
import session from 'express-session'
import { COOKIE_DURATION } from '@/common/Constants'
import { getRuntimeSecret, RuntimeSecret } from '@/common/node/RuntimeSecret'
import { routeApi } from './routers/routeApi'
import { routeVue } from './routers/routeVue'
import { createErrorHandler } from './utils/createErrorHandler'
import { generate404 } from './middlewares/generate404'
import { ServerAppContext } from '@/web/server/ServerAppContext'

export function createServerApp(ctx: ServerAppContext) {
    const app = express()

    // Express sits behind proxy in production
    app.set('trust proxy', ctx.trustProxy)

    // Handle non-GET request bodies
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    // Pino
    app.use(ctx.httpLogger)

    // Cookies session
    app.use(session({
        secret: getRuntimeSecret(RuntimeSecret.ENCRYPTION_KEY),
        resave: false,
        saveUninitialized: false,
        proxy: ctx.trustProxy,
        cookie: {
            maxAge: COOKIE_DURATION,
            httpOnly: true, // Cookies will not be available to Document.cookie api
            secure: DEFINE.WEB_URL.startsWith('https'), // Cookies only sent over https
        },
        store: ctx.sessionStore,
    }))

    // -----------------------------------------------------------------------------
    // Optional Middlewares
    // -----------------------------------------------------------------------------

    if (ctx.enableCors) {
        ctx.httpLogger.logger.info(`Setting CORS origin to ${DEFINE.WEB_URL}`)
        app.use(cors({
            credentials: true,
            origin: DEFINE.WEB_URL,
        }))
    }

    if (ctx.enableStaticFiles) {
        ctx.httpLogger.logger.info(`Serving static files from "${DEFINE.SSR_PUBLIC_DIR}" to "${DEFINE.SSR_PUBLIC_PATH}"`)
        app.use(DEFINE.SSR_PUBLIC_PATH, express.static(DEFINE.SSR_PUBLIC_DIR))
    }

    // -----------------------------------------------------------------------------
    // Request Handlers
    // -----------------------------------------------------------------------------

    app.use('/api', routeApi(ctx))
    app.use('/api', generate404())
    app.use('/api', createErrorHandler(true))

    if (ctx.enableVue) {
        app.use(routeVue())
    }

    app.use(generate404())
    app.use(createErrorHandler(false))

    return app
}
