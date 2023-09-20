import { ComputedRef, computed, unref } from 'vue'
import { useMeta } from 'vue-meta'
import { APP_NAME, APP_THEME_COLOR } from '@/common/Constants'

export const enum TwitterCard {
    Summary = 'summary',
    Large = 'summary_large_image',
}

type LiveMetaField<T> = ComputedRef<T | null | undefined> | T | null | undefined

export type LiveMetaOptions = {
    title: ComputedRef<string> | string
    desc?: LiveMetaField<string>
    image?: LiveMetaField<string>
    imageSize?: LiveMetaField<TwitterCard>
    themeColor?: LiveMetaField<string>
}

export type LiveMeta = {
    title: string
    description?: string
    og: {
        title: string
        description?: string
        image?: string
    }
    twitter: {
        title: string
        description?: string
        image?: string
        card?: TwitterCard
    }
    'theme-color'?: string
}

export function useLiveMeta(options: LiveMetaOptions): LiveMetaOptions {
    useMeta(computed(() => {
        const title = unref(options.title) === APP_NAME
            ? APP_NAME
            : `${unref(options.title)} | ${APP_NAME}`

        const headOptions: LiveMeta = {
            title,
            og: {
                title: title.replace(/"/g, '&quot;'),
            },
            twitter: {
                title: title.replace(/"/g, '&quot;'),
            },
        }

        const description = unref(options.desc)?.replace(/"/g, '&quot;')
        if (description) {
            headOptions.description = description
            headOptions.og.description = description
            headOptions.twitter.description = description
        }

        const image = unref(options.image)
        const imageSize = unref(options.imageSize)
        if (image) {
            headOptions.og.image = image
            headOptions.twitter.image = image
            headOptions.twitter.card = imageSize ?? TwitterCard.Large
        }

        const themeColor = unref(options.themeColor)
        headOptions['theme-color'] = themeColor ?? APP_THEME_COLOR

        return headOptions
    }))

    return options
}
