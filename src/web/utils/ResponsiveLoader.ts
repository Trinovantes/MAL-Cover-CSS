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

export async function getImage(filename: string): Promise<ResponsiveImage> {
    return import(`@/web/assets/img/${filename}`) as Promise<ResponsiveImage>
}
