import { DefinePlugin } from 'webpack'
import merge from 'webpack-merge'

import { commonNodeConfig } from './webpack.config.common'
import { distClientDir, distServerDir, publicPath, srcWebDir, staticDir } from './webpack.constants'

export default merge(commonNodeConfig, {
    entry: {
        www: `${srcWebDir}/www.ts`,
    },

    plugins: [
        new DefinePlugin({
            'DEFINE.PUBLIC_PATH': JSON.stringify(publicPath),
            'DEFINE.CLIENT_DIR': JSON.stringify(distClientDir),
            'DEFINE.SERVER_DIR': JSON.stringify(distServerDir),
            'DEFINE.STATIC_DIR': JSON.stringify(staticDir),
        }),
    ],
})
