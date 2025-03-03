import { PlaywrightTestConfig } from '@playwright/test'
import { getBuildSecret } from 'build/BuildSecret'

const webUrl = getBuildSecret('WEB_URL')
const isContinousIntegration = Boolean(process.env.CI)

const config: PlaywrightTestConfig = {
    testDir: './tests/e2e',
    outputDir: './tests/e2e/results',

    timeout: 10 * 1000, // ms
    retries: isContinousIntegration ? 3 : 0,
    workers: isContinousIntegration ? 1 : undefined,
    reporter: 'list',

    // Throw error when there are "test.only" tests in CI (e.g. focus test being commited)
    forbidOnly: isContinousIntegration,

    webServer: {
        command: 'yarn devWebClient',
        url: webUrl,
        timeout: 60 * 1000, // ms
        reuseExistingServer: !isContinousIntegration,
    },

    use: {
        baseURL: webUrl,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        launchOptions: {
            args: ['--host-resolver-rules=MAP test.malcovercss.link 0.0.0.0'],
        },
    },
}

export default config
