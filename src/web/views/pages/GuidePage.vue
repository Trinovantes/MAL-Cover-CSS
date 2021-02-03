<template>
    <article>
        <div class="row">
            <div class="col">
                <h1>{{ pageTitle }}</h1>

                <h2>1. Sign In</h2>
                <p>You first need to sign in with your <a href="https://myanimelist.net">MyAnimeList.net</a> account. This tool then periodically scans your profile and generates stylesheets to stylize your anime and manga entries.</p>

                <h2>2. Link to a Generated Stylesheet</h2>
                <p>
                    It may take a few hours after registration before your profile is scanned.
                    Once your anime and manga list has been scanned, you can then import one of the following stylesheets into your profile's theme.
                </p>
                <p>
                    If you are using a theme that someone else has created, please consult the original designer.
                    If you are creating your own theme, read the next section for more information.
                </p>

                <CodeBlock
                    lang="css"
                    code="generatedStylesheets.css"
                />

                <div class="callout warning">
                    <h3>Important Note on CSS Imports</h3>
                    <p>
                        Since MyAnimeList.net only allows external images in CSS urls, you will need to use a (technically) invalid import syntax in order for the import to work properly (web browsers will still parse the import properly).
                    </p>

                    <CodeBlock
                        lang="css"
                        code="brokenImport.css"
                    />
                </div>

                <h3>Example Usage</h3>
                <p>
                    You can view this example on my <a href="https://myanimelist.net/animelist/Trinovantes">profile page</a>.
                    The full theme is available <a href="/example-covers.css">here</a>.
                    The key parts of this theme are highlighted:
                </p>
                <ul>
                    <li>On line 1, I've imported a generated stylesheet</li>
                    <li>On line 19, I've styled the pseudoelement <code>a.animetitle:before</code> to display the corresponding anime's cover image in its background</li>
                </ul>

                <CodeBlock
                    lang="css"
                    code="exampleUsage.css"
                    highlights="1,19"
                />

                <h3>How This Works</h3>
                <p>
                    Every anime and manga entry in your profile page contains HTML elements with unique identifiers.
                    For example, the anime <a href="https://myanimelist.net/anime/820/Ginga_Eiyuu_Densetsu">Ginga Eiyuu Densetsu</a> has an id of 820 on MyAnimeList.net.
                    If you have this anime in your profile page, you will see that its entry contains elements that uniquely identify it as shown on lines 11 and 40.
                    As a result, you can style those uniquely identifiable elements to display the anime's cover image as their background.
                </p>

                <CodeBlock
                    lang="html"
                    code="exampleEntry.html"
                    highlights="11-13,40"
                />
            </div>
        </div>
    </article>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import { VuexAccessor } from '@views/mixins/VuexAccessor'
import { Page } from '@views/mixins/Page'

@Component({
    components: {
        CodeBlock: () => import('@views/components/CodeBlock.vue'),
    },
})
export default class GuidePage extends mixins(Page, VuexAccessor) {
    getPageTitle = 'Guide'
}
</script>
