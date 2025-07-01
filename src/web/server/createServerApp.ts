import cors from 'cors'
import express from 'express'
import session from 'express-session'
import type { ServerAppContext } from './ServerAppContext.ts'
import { getRuntimeSecret } from '../../common/node/RuntimeSecret.ts'
import { COOKIE_DURATION } from '../../common/Constants.ts'
import { generate404 } from './middlewares/generate404.ts'
import { routeApi } from './routers/routeApi.ts'
import { routeVue } from './routers/routeVue.ts'
import { createErrorHandler } from './utils/createErrorHandler.ts'

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
        secret: getRuntimeSecret('ENCRYPTION_KEY'),
        resave: false,
        saveUninitialized: false,
        proxy: ctx.trustProxy,
        cookie: {
            maxAge: COOKIE_DURATION,
            httpOnly: true, // Cookies will not be available to Document.cookie api
            secure: __WEB_URL__.startsWith('https'), // Cookies only sent over https
        },
        store: ctx.sessionStore,
    }))

    // -----------------------------------------------------------------------------
    // Optional Middlewares
    // -----------------------------------------------------------------------------

    if (ctx.enableCors) {
        ctx.httpLogger.logger.info(`Setting CORS origin to ${__WEB_URL__}`)
        app.use(cors({
            credentials: true,
            origin: __WEB_URL__,
        }))
    }

    if (ctx.enableStaticFiles) {
        ctx.httpLogger.logger.info(`Serving static files from "${__SSR_PUBLIC_DIR__}" to "${__SSR_PUBLIC_PATH__}"`)
        app.use(__SSR_PUBLIC_PATH__, express.static(__SSR_PUBLIC_DIR__))
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
