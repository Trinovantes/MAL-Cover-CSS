export type ResponsiveImage = {
    src: string
    srcSet: string
    images: Array<{
        path: string
        width: number
        height: number
    }>
    width: number
    height: number

    placeholder?: string

    toString(): () => string
}
