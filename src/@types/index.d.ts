import { HydrationMap } from '@/web/client/store/Hydration'

declare global {
    const DEFINE: Readonly<{
        IS_DEV: boolean
        IS_SSR: boolean
        GIT_HASH: string

        WEB_URL: string
        WEB_PORT: string
        API_URL: string
        API_PORT: string

        // ssr specific
        SSR_PUBLIC_PATH: string
        SSR_PUBLIC_DIR: string
        SSR_MANIFEST_FILE: string
        SSR_HTML_TEMPLATE: string
    }>

    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/consistent-type-definitions
    interface Window extends HydrationMap {}
}

export {}
