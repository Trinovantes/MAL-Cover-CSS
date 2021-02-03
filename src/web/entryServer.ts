import { Request, Response } from 'express'
import Vue from 'vue'

import { createApp } from '@web/app'
import { IRootState } from '@web/store'

// ----------------------------------------------------------------------------
// App
// ----------------------------------------------------------------------------

export interface AppContext {
    url: string
    title: string
    statusCode: number
    req: Request
    res: Response

    rendered?: () => void
    state?: IRootState
}

export default async(ssrContext: AppContext): Promise<Vue> => {
    const { app, router, store } = createApp(ssrContext)

    // Set server-side router's location
    await router.push(ssrContext.url)

    // Wait until router resolved all async hooks
    await new Promise<void>((resolve) => {
        router.onReady(() => {
            resolve()
        })
    })

    ssrContext.rendered = () => {
        ssrContext.state = store.state
    }

    const matchedComponents = app.$router.getMatchedComponents()
    if (!matchedComponents.length) {
        throw new Error('Vue Router failed to match a path')
    }

    return app
}
