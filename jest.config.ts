import type { Config } from '@jest/types/build/index'

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
