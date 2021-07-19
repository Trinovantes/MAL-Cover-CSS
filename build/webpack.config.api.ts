import { merge } from 'webpack-merge'
import { commonNodeConfig, distApiDir, srcApiDir } from './webpack.common'

// ----------------------------------------------------------------------------
// Api
// ----------------------------------------------------------------------------

export default merge(commonNodeConfig, {
    entry: {
        www: `${srcApiDir}/www.ts`,
    },

    output: {
        path: distApiDir,
    },
})
