import { MetaSource } from 'vue-meta'
import { APP_THEME_COLOR } from '@/common/Constants'
import { merge } from 'lodash'

interface PageHeadOptions {
    title: string
    desc?: string
    image?: string
    themeColor?: string
}

export function createPageHeadOptions(options: PageHeadOptions): MetaSource {
    const title = options.title
    const headOptions: Record<string, string | Record<string, string>> = {
        title,
        og: {
            title: title.replace(/"/g, '&quot;'),
        },
        twitter: {
            title: title.replace(/"/g, '&quot;'),
        },
    }

    const description = options.desc?.replace(/"/g, '&quot;')
    if (description) {
        merge(headOptions, {
            description,
            og: {
                description,
            },
            twitter: {
                description,
            },
        })
    }

    const image = options.image
    if (image) {
        merge(headOptions, {
            og: {
                image,
            },
            twitter: {
                card: 'summary_large_image',
                image,
            },
        })
    }

    const themeColor = options.themeColor ?? APP_THEME_COLOR
    merge(headOptions, {
        'theme-color': themeColor,
    })

    return headOptions
}
