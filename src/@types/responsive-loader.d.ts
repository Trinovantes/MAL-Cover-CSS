type ResponsiveLoaderAsset = {
    src: string
    srcSet: string
    placeholder: string | undefined
    images: Array<{ path: string; width: number; height: number }>
    width: number
    height: number
    toString: () => string
}

declare module '*&rl' {
    const src: ResponsiveLoaderAsset
    export default src
}

declare module '*?rl' {
    const src: ResponsiveLoaderAsset
    export default src
}
