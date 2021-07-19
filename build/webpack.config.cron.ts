import { merge } from 'webpack-merge'
import { commonNodeConfig, distCronDir, srcCronDir } from './webpack.common'

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
