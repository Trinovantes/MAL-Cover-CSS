import { HydrationMap } from '@/web/client/store/Hydration'

declare global {
    const DEFINE: {
        IS_DEV: boolean
        IS_SSR: boolean
        GIT_HASH: string

        APP_URL: string
        APP_PORT: string

        // server specific
        PUBLIC_PATH?: string
        SERVER_DIST_DIR?: string
        CLIENT_DIST_DIR?: string
        MANIFEST_FILE?: string
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Window extends HydrationMap {}
}

export {}
