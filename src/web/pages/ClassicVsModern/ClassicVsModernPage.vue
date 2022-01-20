<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useMeta } from 'vue-meta'
import { createPageHeadOptions } from '@/web/utils/PageHeadOptions'
import { ResponsiveImage } from '@/web/utils/ResponsiveLoader'

export default defineComponent({
    setup() {
        const title = 'Classic vs. Modern Templates'

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const img = require(`./img/modern-template.png?size=${DEFINE.SOCIAL_IMAGE_SIZE}`) as ResponsiveImage

        useMeta(computed(() => {
            return createPageHeadOptions({
                title,
                image: img.src,
            })
        }))

        return {
            title,
        }
    },
})
</script>

<template>
    <article class="container text-container">
        <h1>
            {{ title }}
        </h1>

        <section>
            <p>
                This website was originally created before MyAnimeList launched their new "Modern" templates in 2016.
            </p>

            <SimpleImage
                :img="require('./img/modern-template.png?size=800')"
            >
                Default "Modern" template
            </SimpleImage>

            <p>
                Back then, "Classic" templates did not include cover images. As a result, everybody relied on third-party tools to generate the CSS needed to insert cover images into each entry's HTML background.
            </p>

            <p>
                Nowadays, this website is simply a relic of the past for users who do not want to switch and want to continue to use Classic templates.
            </p>

            <SimpleImage
                :img="require('./img/enable-modern-cover-image.png?size=800')"
            >
                Modern templates can include cover images without third-party tools
            </SimpleImage>
        </section>
    </article>
</template>
