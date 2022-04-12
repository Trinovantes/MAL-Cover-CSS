import { Chunk } from 'webpack'
import { isDev } from '../webpack.common'

let chunkNameCounter = 0
const chunkNameMap = new Map<string, number>()

export function createOutputNameFn(ext: string, isInitial: boolean): (pathData: unknown) => string {
    const suffix = isDev
        ? ext
        : `[contenthash].${ext}`

    return (pathData): string => {
        const data = pathData as { chunk: Chunk }
        const chunkId = String(data.chunk.id)

        // Only emit initial vendors file as 'vendor.js'
        if (chunkId.startsWith('vendors') && isInitial) {
            return `vendors.${suffix}`
        }

        if (chunkId.endsWith('_vue')) {
            const pathParts = chunkId.split('_').reverse()
            const fileName = (pathParts[1] === 'index')
                ? pathParts[2]
                : pathParts[1]

            return `${fileName}.${suffix}`
        }

        let id = isDev
            ? '[name]'
            : chunkNameMap.get(chunkId)

        if (id === undefined) {
            chunkNameCounter += 1
            id = chunkNameCounter
            chunkNameMap.set(chunkId, id)
        }

        return `${id}.${suffix}`
    }
}
