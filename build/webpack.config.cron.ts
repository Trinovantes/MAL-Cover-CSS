import { merge } from 'webpack-merge'
import { commonNodeConfig } from './webpack.common'
import { srcCronDir, distCronDir } from './BuildConstants'

// ----------------------------------------------------------------------------
// Cron
// ----------------------------------------------------------------------------

export default merge(commonNodeConfig, {
    entry: {
        generator: `${srcCronDir}/generator.ts`,
        scraper: `${srcCronDir}/scraper.ts`,
    },

    output: {
        path: distCronDir,
    },
})
