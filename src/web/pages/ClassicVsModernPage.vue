<template>
    <article class="container text-container">
        <h1>
            Classic vs. Modern Templates
        </h1>

        <section>
            <p>
                This website was originally created before MyAnimeList launched their new "Modern" templates in 2016.
            </p>

            <q-img
                :src="require('@/web/assets/img/classic-vs-modern/modern-template.png?size=800').src"
            >
                <span class="caption">
                    Default "Modern" template
                </span>
            </q-img>

            <p>
                Back then, "Classic" templates did not include cover images. As a result, everybody relied on third-party tools to generate the CSS needed to insert cover images into each entry's HTML background.
            </p>

            <p>
                Nowadays, this website is simply a relic of the past for users who do not want to switch and want to continue to use Classic templates.
            </p>

            <q-img
                :src="require('@/web/assets/img/classic-vs-modern/enable-modern-cover-image.png?size=800').src"
            >
                <span class="caption">
                    Modern templates can include cover images without third-party tools
                </span>
            </q-img>
        </section>
    </article>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    setup() {
        //
    },
})
</script>
