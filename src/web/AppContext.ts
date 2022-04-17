import { useSSRContext } from '@vue/runtime-core'
import { SSRContext } from '@vue/server-renderer'
import express from 'express'

export type AppContext = SSRContext & {
    url: string
    teleports: Record<string, string>
    _matchedComponents: Set<string>

    // Required by Quasar
    req: express.Request
    res: express.Response
    _modules: Set<unknown>
    _meta: Record<string, unknown>
}

export function useAppContext(): AppContext | undefined {
    if (DEFINE.IS_SSR) {
        return useSSRContext()
    } else {
        return undefined
    }
}
