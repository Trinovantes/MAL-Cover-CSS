<script lang="ts" setup>
import examplePreviewImg from '@img/example-covers-preview.jpg?rl'
import { useSeoMeta } from '@unhead/vue'

const title = 'Classic vs. Modern Templates'
const ogImage = examplePreviewImg.src
useSeoMeta({
    title,
    ogImage,
    twitterCard: 'summary_large_image',
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

            <q-img
                :src="require('./img/modern-template.png?size=800').src"
            >
                <div class="absolute-bottom caption">
                    Default "Modern" template
                </div>
            </q-img>

            <p>
                Back then, "Classic" templates did not include cover images. As a result, everybody relied on third-party tools to generate the CSS needed to insert cover images into each entry's HTML background.
            </p>

            <p>
                Nowadays, this website is simply a relic of the past for users who do not want to switch and want to continue to use Classic templates.
            </p>

            <q-img
                :src="require('./img/enable-modern-cover-image.png?size=800').src"
            >
                <div class="absolute-bottom caption">
                    Modern templates can include cover images without third-party tools
                </div>
            </q-img>
        </section>
    </article>
</template>
