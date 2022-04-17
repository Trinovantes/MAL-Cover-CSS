declare global {
    const DEFINE: {
        IS_DEV: boolean
        IS_SSR: boolean
        GIT_HASH: string
        SOCIAL_IMAGE_SIZE: number

        // ssg specific
        PUBLIC_DIR: string
        PUBLIC_PATH: string
        ENTRY_FILE: string
        MANIFEST_FILE: string
    }
}

export {}
