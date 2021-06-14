<template>
    <article class="container text-container">
        <h1>
            {{ title }}
        </h1>

        <section>
            <p>
                If you do not want to write your own CSS or are looking for a starting point for your list design, you can try out this example.
            </p>

            <div class="callout warning">
                <p>
                    This example list design can only style your score. If wish to include additional information (e.g. tags) in your lists, then you need to make additional changes to the CSS yourself.
                </p>

                <ClientOnly>
                    <q-img
                        :src="require('@/web/assets/img/example/only-show-score.png?size=800').src"
                    />
                </ClientOnly>
            </div>

            <h2>
                1. Switch to Classic mode
            </h2>

            <p>
                First, go into <ExternalLink href="https://myanimelist.net/ownlist/style">List Style Design</ExternalLink> and click on Classic template.
            </p>

            <ClientOnly>
                <q-img
                    :src="require('@/web/assets/img/example/enable-classic-template.png?size=800').src"
                />
            </ClientOnly>

            <h2>
                2. Create advanced CSS list design
            </h2>

            <p>
                After enabling Classic template, you can then go into Advanced CSS List Design and create a new Advanced CSS List Design.
            </p>

            <ClientOnly>
                <q-img
                    :src="require('@/web/assets/img/example/create-advanced-css.png?size=800').src"
                />
            </ClientOnly>

            <p>
                Next paste the following code into the textbox and click Save.
            </p>

            <CodeBlock
                lang="css"
                :code="require('@/web/assets/raw/home/how-to-use-example-covers.css')"
            />

            <ClientOnly>
                <q-img
                    :src="require('@/web/assets/img/example/save-advanced-css.png?size=800').src"
                />
            </ClientOnly>

            <div class="callout">
                <h3>
                    Want to make your own customizations?
                </h3>
                <p>
                    Alternatively, you can copy/paste the contents of <ExternalLink href="https://www.malcovercss.link/example-covers.css">example-covers.css</ExternalLink> into the custom CSS textbox and make your own changes to the example list design.
                    Don't forget to escape the <code>@import</code> with a slash.
                </p>
            </div>

            <h2>
                3. Set your anime/manga list style to use your new design
            </h2>

            <p>
                Finally, follow the link in the notice MyAnimeList showed you in the previous step to go into your List Style settings and set your anime/manga lists to use your new design.
            </p>

            <ClientOnly>
                <q-img
                    :src="require('@/web/assets/img/example/set-list-style.png?size=800').src"
                />
            </ClientOnly>
        </section>

        <aside>
            <div class="sticky">
                <p>
                    You can see this example list design in action on my <ExternalLink href="https://myanimelist.net/animelist/Trinovantes">profile page</ExternalLink>.
                </p>

                <ClientOnly>
                    <q-img
                        :src="require('@/web/assets/img/home/example-covers.jpg?size=400').src"
                    >
                        <span class="caption">
                            Example List Design
                        </span>
                    </q-img>
                </ClientOnly>
            </div>
        </aside>
    </article>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useMeta } from 'vue-meta'
import { createPageHeadOptions } from '@/web/utils/PageHeadOptions'
import { getSocialImage } from '@/web/utils/ResponsiveLoader'

export default defineComponent({
    name: 'ExamplePage',

    setup() {
        const title = 'Example List Design'
        const img = getSocialImage('home/example-covers.jpg')

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
