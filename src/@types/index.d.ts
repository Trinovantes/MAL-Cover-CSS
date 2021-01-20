import { BundleRenderer } from 'vue-server-renderer'
import { Express } from 'express'

import { IRootState } from '@web/store'

declare global {
    const DEFINE: {
        IS_DEV: boolean

        PUBLIC_PATH?: string
        SERVER_DIR?: string
        CLIENT_DIR?: string
        STATIC_DIR?: string
    }

    interface Window {
        __INITIAL_STATE__: IRootState
    }

    type RendererSetup = (app: Express, updateRenderer: (newRenderer: BundleRenderer) => void) => Promise<void>
}
