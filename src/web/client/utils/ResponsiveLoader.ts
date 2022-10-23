export type ResponsiveLoaderAsset = {
    src: string
}

export function getImage(filename: string): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const img = require(`@/web/client/assets/img/${filename}`) as ResponsiveLoaderAsset
    return img.src
}

export async function loadImage(filename: string): Promise<string> {
    const img = await import(`@/web/client/assets/img/${filename}`) as ResponsiveLoaderAsset
    return img.src
}
