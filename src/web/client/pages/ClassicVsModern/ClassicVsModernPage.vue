<script lang="ts" setup>
import { useLiveMeta } from '../../utils/useLiveMeta'
import type { ResponsiveLoaderAsset } from '../../utils/ResponsiveLoader'

const title = 'Classic vs. Modern Templates'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const img = require('./img/modern-template.png?size=800') as ResponsiveLoaderAsset

useLiveMeta({
    title,
    image: img.src,
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

            <LazyImage
                :src="require('./img/modern-template.png?size=800').src"
            >
                Default "Modern" template
            </LazyImage>

            <p>
                Back then, "Classic" templates did not include cover images. As a result, everybody relied on third-party tools to generate the CSS needed to insert cover images into each entry's HTML background.
            </p>

            <p>
                Nowadays, this website is simply a relic of the past for users who do not want to switch and want to continue to use Classic templates.
            </p>

            <LazyImage
                :src="require('./img/enable-modern-cover-image.png?size=800').src"
            >
                Modern templates can include cover images without third-party tools
            </LazyImage>
        </section>
    </article>
</template>
