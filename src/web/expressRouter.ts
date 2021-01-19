import { BundleRenderer, createBundleRenderer } from 'vue-server-renderer'
import fs from 'fs'
import webpack from 'webpack'
import WebpackDevMiddleware from 'webpack-dev-middleware'
import WebpackHotMiddleware from 'webpack-hot-middleware'
import MemoryFileSystem from 'memory-fs'
import express, { RequestHandler, Express, ErrorRequestHandler, Router } from 'express'
import createHttpError, { HttpError } from 'http-errors'

import clientConfig from '@build/webpack.config.web.client'
import serverConfig from '@build/webpack.config.web.server'

import template from '@views/index.html'
import { AppContext } from '@web/entryServer'
import Constants from '@common/Constants'
import { logger } from '@common/utils/logger'

// ----------------------------------------------------------------------------
// ENV
// ----------------------------------------------------------------------------

const publicPath = DEFINE.PUBLIC_PATH
const staticDir = DEFINE.STATIC_DIR
const serverDir = DEFINE.SERVER_DIR
const clientDir = DEFINE.CLIENT_DIR

if (!publicPath || !serverDir || !clientDir || !staticDir) {
    throw new Error('Missing DEFINES')
}

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export async function createViewRouter(app: Express): Promise<Router> {
    let renderer: BundleRenderer | undefined

    if (DEFINE.IS_DEV) {
        await setupDevMiddleware(app, (hotReloadRenderer) => {
            renderer = hotReloadRenderer
        })
    } else {
        renderer = setupProdMiddleware()
    }

    const vueHandler: RequestHandler = (req, res, next) => {
        if (!renderer) {
            return next(new createHttpError.InternalServerError('Undefined Renderer'))
        }

        const ssrContext: AppContext = {
            url: req.originalUrl,
            title: Constants.APP_NAME,
            status: 200,
            req: req,
            res: res,
        }

        renderer.renderToString(ssrContext, (error, html) => {
            if (error) {
                logger.warn('Vue SSR Error (%s:%s)', error.name, error.message)
                logger.debug(error.stack)
                return next(new createHttpError.InternalServerError(error.message))
            }

            return res.status(ssrContext.status).send(html)
        })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        const error = err as Error | HttpError

        // Set locals, only providing error in development
        const status = DEFINE.IS_DEV && (error instanceof HttpError) ? error.status : 500
        const message = DEFINE.IS_DEV ? error.stack || 'No stacktrace available' : 'Internal Server Error'

        return res.status(status).send(`<pre>${message}</pre>`)
    }

    const router = express.Router()
    router.use(vueHandler)
    router.use(errorHandler)
    return router
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function setupDevMiddleware(app: Express, onRendererUpdate: (renderer: BundleRenderer) => void) {
    return new Promise<void>((resolve, reject) => {
        // We are reading the bundle and manifest at runtime instead of importing them at
        // compile time is because they are not generated until after compile time
        let bundleString: string
        let manifestString: string

        const updateRenderer = () => {
            if (!bundleString || !manifestString) {
                return
            }

            const serverBundle = Object.assign({}, JSON.parse(bundleString) as unknown)
            const clientManifest = Object.assign({}, JSON.parse(manifestString) as unknown)
            const renderer = createBundleRenderer(serverBundle, {
                runInNewContext: false,
                template: template,
                basedir: clientDir,
                clientManifest: clientManifest,
            })

            onRendererUpdate(renderer)
            resolve()
        }

        const memoryFs = new MemoryFileSystem()

        // Watch for entryClient changes
        {
            const clientCompiler = webpack(clientConfig)
            clientCompiler.hooks.done.tap('SSR updateRenderer', (stats) => {
                if (stats.hasErrors()) {
                    return reject(new Error('Failed to compile client'))
                }

                manifestString = memoryFs.readFileSync(`${clientDir}/vue-ssr-client-manifest.json`, 'utf-8') as string
                updateRenderer()
            })

            const devMiddleware = WebpackDevMiddleware(clientCompiler, {
                fs: memoryFs,
                publicPath: publicPath,
            })
            const hotMiddleware = WebpackHotMiddleware(clientCompiler, {
                heartbeat: 5000,
            })

            app.use(devMiddleware)
            app.use(hotMiddleware)
        }

        // Watch for entryServer changes
        {
            const serverCompiler = webpack(serverConfig)
            serverCompiler.outputFileSystem = memoryFs
            serverCompiler.watch({}, (error) => {
                if (error) {
                    return reject(new Error('Failed to compile server'))
                }

                bundleString = memoryFs.readFileSync(`${serverDir}/vue-ssr-server-bundle.json`, 'utf-8') as string
                updateRenderer()
            })
        }
    })
}

function setupProdMiddleware() {
    const serverBundle = Object.assign({}, JSON.parse(fs.readFileSync(`${serverDir}/vue-ssr-server-bundle.json`, 'utf-8')) as unknown)
    const clientManifest = Object.assign({}, JSON.parse(fs.readFileSync(`${clientDir}/vue-ssr-client-manifest.json`, 'utf-8')) as unknown)

    const renderer = createBundleRenderer(serverBundle, {
        runInNewContext: false,
        template: template,
        basedir: clientDir,
        clientManifest: clientManifest,
    })

    return renderer
}
