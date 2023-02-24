import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
    bail: true,

    testPathIgnorePatterns: [
        './tests/e2e/',
    ],

    setupFiles: [
        './tests/unit/setup.ts',
    ],
}

export default config
