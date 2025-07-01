import type { HydrationMap } from '../web/client/store/Hydration.ts'

declare global {
    const __IS_DEV__: boolean
    const __IS_SSR__: boolean
    const __GIT_HASH__: string

    const __WEB_URL__: string
    const __WEB_PORT__: string
    const __API_URL__: string
    const __API_PORT__: string

    // ssr specific
    const __SSR_PUBLIC_PATH__: string
    const __SSR_PUBLIC_DIR__: string
    const __SSR_MANIFEST_FILE__: string
    const __SSR_HTML_TEMPLATE__: string

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/consistent-type-definitions
    interface Window extends HydrationMap {}
}

export {}
