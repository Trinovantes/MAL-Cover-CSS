import { merge } from 'lodash'
import { computed, ComputedRef, unref } from 'vue'
import { useMeta } from 'vue-meta'
import { APP_NAME, APP_THEME_COLOR } from '@/common/Constants'

type MetaOptions = {
    title: ComputedRef<string> | string
    desc?: ComputedRef<string | undefined> | string
    image?: ComputedRef<string | undefined> | string
    themeColor?: ComputedRef<string | undefined> | string
}

export function useLiveMeta(options: MetaOptions): MetaOptions {
    useMeta(computed(() => {
        const title = unref(options.title) === APP_NAME
            ? APP_NAME
            : `${unref(options.title)} | ${APP_NAME}`

        const headOptions = {
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

        const image = unref(options.image)
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
    }))

    return options
}
