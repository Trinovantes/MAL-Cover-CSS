import path from 'path'
import { RuntimeSecret } from '@/common/utils/RuntimeSecret'
import type { PlaywrightTestConfig } from '@playwright/test'

// Assume we are running webpack from the project root (../)
const rootDir = path.resolve()
const testDir = path.join(rootDir, 'tests', 'e2e')

const url = 'http://test.malcovercss.link:9040'
const isContinousIntegration = Boolean(process.env.CI)

const config: PlaywrightTestConfig = {
    testDir,
    timeout: 10 * 1000, // ms
    retries: isContinousIntegration ? 2 : 0,
    workers: isContinousIntegration ? 2 : 4,

    // Throw error when there are "test.only" tests in CI (e.g. focus test being commited)
    forbidOnly: isContinousIntegration,

    webServer: {
        command: 'yarn start',
        url,
        timeout: 120 * 1000, // ms
        reuseExistingServer: !isContinousIntegration,
        env: {
            [RuntimeSecret.IS_TEST]: 'true',
        },
    },

    use: {
        baseURL: url,
        trace: 'on-first-retry',
        viewport: {
            width: 1440,
            height: 800,
        },
    },
}

export default config
