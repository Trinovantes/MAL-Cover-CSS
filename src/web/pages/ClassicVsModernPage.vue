<template>
    <article class="container text-container">
        <h1>
            {{ title }}
        </h1>

        <section>
            <p>
                This website was originally created before MyAnimeList launched their new "Modern" templates in 2016.
            </p>

            <ResponsiveImage
                :img="require('@/web/assets/img/classic-vs-modern/modern-template.png?size=800')"
                caption="Default &quot;Modern&quot; template"
            />

            <p>
                Back then, "Classic" templates did not include cover images. As a result, everybody relied on third-party tools to generate the CSS needed to insert cover images into each entry's HTML background.
            </p>

            <p>
                Nowadays, this website is simply a relic of the past for users who do not want to switch and want to continue to use Classic templates.
            </p>

            <ResponsiveImage
                :img="require('@/web/assets/img/classic-vs-modern/enable-modern-cover-image.png?size=800')"
                caption="Modern templates can include cover images without third-party tools"
            />
        </section>
    </article>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useMeta } from 'vue-meta'
import { createPageHeadOptions } from '@/web/utils/PageHeadOptions'
import { getSocialImage } from '@/web/utils/ResponsiveLoader'

export default defineComponent({
    name: 'ClassicVsModernPage',

    setup() {
        const title = 'Classic vs. Modern Templates'
        const img = getSocialImage('classic-vs-modern/modern-template.png')

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
