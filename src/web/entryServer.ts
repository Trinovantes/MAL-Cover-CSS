import { VueSsgServer } from 'puppeteer-prerender-plugin'
import { AppContext, createApp } from './app'
import { renderMetaToString } from 'vue-meta/ssr'

const server = new VueSsgServer({
    staticDir: DEFINE.PUBLIC_DIR,
    publicPath: DEFINE.PUBLIC_PATH,
    clientEntryJs: DEFINE.CLIENT_ENTRY_JS,
    clientEntryCss: DEFINE.CLIENT_ENTRY_CSS,
    manifestFile: DEFINE.MANIFEST_FILE,

    createSsrContext(req, res) {
        const appContext: AppContext = {
            url: req.originalUrl,

            req: req,
            res: res,
            _modules: new Set(),
            _meta: {},
        }

        return appContext
    },

    createApp(ssrContext) {
        return createApp(ssrContext as AppContext)
    },

    async onPostRender(app, ssrContext) {
        await renderMetaToString(app, ssrContext)
    },
})

export default server
