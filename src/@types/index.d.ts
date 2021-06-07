declare global {
    const DEFINE: {
        IS_DEV: boolean

        // web-specific
        IS_PRERENDER?: Promise<void>
        PRERENDER_READY_EVENT: string
    }
}

export {}
