<script lang="ts" setup>
import examplePreviewImg from '@/web/client/assets/img/example-covers-preview.jpg?rl'
import { useSeoMeta } from '@unhead/vue'

const title = 'Guide'
const ogImage = examplePreviewImg.src
useSeoMeta({
    title,
    ogImage,
    twitterCard: 'summary_large_image',
})
</script>

<template>
    <article class="container text-container full">
        <h1>
            {{ title }}
        </h1>

        <section>
            <p>
                This website is intended to be used by users who wish to add cover images to Classic list designs.
                If you are using a Modern list design, then you do not need this service.
                You can learn more about the differences <router-link to="/classic-vs-modern">here</router-link>.
            </p>

            <h2>1. Sign In</h2>
            <p>
                You first need to sign in with your MyAnimeList account.
                This website then periodically scans your profile and updates the global stylesheets to include your anime and manga entries.
            </p>

            <div class="callout warning">
                <p>
                    For privacy reasons, MyAnimeList does not share NSFW entries from your lists.
                    As a result, the generated CSS will not contain CSS rules to add their cover images.
                </p>
            </div>

            <h2>2. Link to a Generated Stylesheet</h2>
            <p>
                It may take a few hours after registration before your profile is scanned.
                Once your anime and manga list has been scanned, you can then import one of the following stylesheets in your list design.
            </p>
            <p>
                If you are using a list design that someone else has created, please consult the original developer.
                If you are creating your own list design, read the next section for more information.
            </p>

            <CodeBlock
                :code="require('./raw/generated-stylesheets.css')"
            />

            <div class="callout warning">
                <h3>Important Note on CSS Imports</h3>
                <p>
                    Since MyAnimeList only allows external images URLs in CSS, you will need to use an invalid import syntax in order to import the file (web browsers will still be able to parse the import).
                </p>

                <CodeBlock
                    :code="require('./raw/broken-import.css')"
                />
            </div>

            <h3>How This Works</h3>
            <p>
                Every anime and manga entry in your lists will contain HTML elements with unique identifiers.
                You can style these uniquely identifiable elements to display the corresponding anime's or manga's cover image in their backgrounds.
            </p>
            <p>
                For example, the anime <ExternalLink href="https://myanimelist.net/anime/820/Ginga_Eiyuu_Densetsu">Ginga Eiyuu Densetsu</ExternalLink> has an id of 820 on MyAnimeList.
                If you have this anime in your list, then your list page will contain the following HTML.
            </p>

            <CodeBlock
                :code="require('./raw/example-list-entry.html')"
                language="html"
            />

            <h3>Example Usage</h3>
            <p>
                The <router-link to="/example">example list design</router-link> makes use of the generated stylesheets.
                You can see this example in action on my <ExternalLink href="https://myanimelist.net/animelist/Trinovantes">profile page</ExternalLink>.
            </p>

            <CodeBlock
                :code="require('./raw/example-usage.css')"
            />
        </section>
    </article>
</template>
