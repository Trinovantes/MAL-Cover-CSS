export interface ResponsiveImage {
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

export function getSocialImage(filename: string): ResponsiveImage {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`@/web/assets/img/${filename}?size=400`) as ResponsiveImage
}
