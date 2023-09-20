import { SSRContext } from '@vue/server-renderer'
import express from 'express'
import { createPinia } from 'pinia'
import { useSSRContext } from 'vue'

type QuasarSsrContext = {
    req: express.Request
    res: express.Response
    _modules: Set<unknown>
    _meta: Partial<{
        htmlAttrs: string
        headTags: string
        endingHeadTags: string
        bodyClasses: string
        bodyAttrs: string
        bodyTags: string
    }>
}

type VueSsrAssetsPluginContext = {
    _matchedComponents: Set<string>
}

export type AppContext = SSRContext & QuasarSsrContext & VueSsrAssetsPluginContext & {
    url: string
    pinia?: ReturnType<typeof createPinia>
    ssrProxyCookies?: string | null
}

export function createAppContext(req: express.Request, res: express.Response): AppContext {
    return {
        url: req.originalUrl,

        req,
        res,
        _modules: new Set(),
        _meta: {},
        _matchedComponents: new Set(),
    }
}

export function useAppContext(): AppContext | undefined {
    if (DEFINE.IS_SSR) {
        return useSSRContext()
    } else {
        return undefined
    }
}
