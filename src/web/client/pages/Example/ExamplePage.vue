<script lang="ts" setup>
import examplePreviewImg from '@/web/client/assets/img/example-covers-preview.jpg?rl'
import { useSeoMeta } from '@unhead/vue'

const title = 'Example List Design'
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
                If you do not want to write your own CSS or are looking for a starting point for your list design, you can try out this example.
            </p>

            <div class="callout warning">
                <p>
                    This example list design can only style your score. If wish to include additional information (e.g. tags) in your lists, then you need to make additional changes to the CSS yourself.
                </p>

                <q-img
                    :src="require('./img/only-show-score.png?size=800').src"
                />
            </div>

            <h2>
                1. Switch to Classic mode
            </h2>

            <p>
                First, go into <ExternalLink href="https://myanimelist.net/ownlist/style">List Style Design</ExternalLink> and click on Classic template.
            </p>

            <q-img
                :src="require('./img/enable-classic-template.png?size=800').src"
            />

            <h2>
                2. Create advanced CSS list design
            </h2>

            <p>
                After enabling Classic template, you can then go into Advanced CSS List Design and create a new Advanced CSS List Design.
            </p>

            <q-img
                :src="require('./img/create-advanced-css.png?size=800').src"
            />

            <p>
                Next paste the following code into the textbox and click Save.
            </p>

            <CodeBlock
                :code="require('../Home/raw/how-to-use-example-covers.css')"
            />

            <q-img
                :src="require('./img/save-advanced-css.png?size=800').src"
            />

            <div class="callout">
                <h3>
                    Want to make your own customizations?
                </h3>
                <p>
                    Alternatively, you can copy/paste the contents of <ExternalLink href="https://malcovercss.link/example-covers.css">example-covers.css</ExternalLink> into the custom CSS textbox and make your own changes to the example list design.
                    Don't forget to escape the <code>@\import</code> with a slash.
                </p>
            </div>

            <h2>
                3. Set your anime/manga list style to use your new design
            </h2>

            <p>
                Finally, follow the link in the notice MyAnimeList showed you in the previous step to go into your List Style settings and set your anime/manga lists to use your new design.
            </p>

            <q-img
                :src="require('./img/set-list-style.png?size=800').src"
            />
        </section>

        <aside>
            <p>
                You can see this example list design in action on my <ExternalLink href="https://myanimelist.net/animelist/Trinovantes">profile page</ExternalLink>.
            </p>

            <q-img
                :src="require('@/web/client/assets/img/example-covers.jpg?size=400').src"
            >
                <div class="absolute-bottom caption">
                    Example List Design
                </div>
            </q-img>
        </aside>
    </article>
</template>
