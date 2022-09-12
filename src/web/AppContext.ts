import { useSSRContext } from 'vue'
import type { SSRContext } from '@vue/server-renderer'
import type express from 'express'
import type { createPinia } from 'pinia'

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

export type AppContext = SSRContext & QuasarSsrContext & {
    url: string
    pinia?: ReturnType<typeof createPinia>
    cookieHeaders?: Array<string>
    teleports: Record<string, string>

    _matchedComponents: Set<string>
}

export function useAppContext(): AppContext | undefined {
    if (DEFINE.IS_SSR) {
        return useSSRContext()
    } else {
        return undefined
    }
}
