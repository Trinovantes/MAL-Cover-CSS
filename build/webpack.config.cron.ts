import { merge } from 'webpack-merge'
import { commonConfig, distCronDir, srcCronDir } from './webpack.common'
import nodeExternals from 'webpack-node-externals'

// ----------------------------------------------------------------------------
// Cron
// ----------------------------------------------------------------------------

export default merge(commonConfig, {
    target: 'node',

    entry: {
        generator: `${srcCronDir}/generator.ts`,
        scraper: `${srcCronDir}/scraper.ts`,
    },

    output: {
        path: distCronDir,
    },

    externals: [
        nodeExternals(),
    ],
})
