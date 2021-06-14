declare global {
    const DEFINE: {
        IS_DEV: boolean
        GIT_HASH: string

        // web-ssg specific
        PUBLIC_DIR: string
        PUBLIC_PATH: string
        CLIENT_ENTRY_JS: string
        CLIENT_ENTRY_CSS: string
        MANIFEST_FILE: string
    }
}

export {}
