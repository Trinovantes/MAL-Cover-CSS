import { VueSsgServer } from 'puppeteer-prerender-plugin'
import { AppContext, createApp } from './app'
import { renderMetaToString } from 'vue-meta/ssr'

const server = new VueSsgServer<AppContext>({
    staticDir: DEFINE.PUBLIC_DIR,
    publicPath: DEFINE.PUBLIC_PATH,
    clientEntryJs: DEFINE.CLIENT_ENTRY_JS,
    clientEntryCss: DEFINE.CLIENT_ENTRY_CSS,
    manifestFile: DEFINE.MANIFEST_FILE,

    // eslint-disable-next-line @typescript-eslint/require-await
    async createSsrContext(req, res) {
        const appContext: AppContext = {
            url: req.originalUrl,

            req: req,
            res: res,
            _modules: new Set(),
            _meta: {},
        }

        return appContext
    },

    async createApp(ssrContext) {
        return await createApp(ssrContext)
    },

    async onPostRender(app, ssrContext) {
        await renderMetaToString(app, ssrContext)

        const appContext = ssrContext
        if (!appContext.teleports) {
            appContext.teleports = {}
        }
        if (!appContext.teleports.head) {
            appContext.teleports.head = ''
        }

        appContext.teleports.head += `
            <link rel="icon" type="image/png" href="/favicon.png">
        `
    },
})

export default server
