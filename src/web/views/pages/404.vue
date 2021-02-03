<template>
    <article>
        <div class="row">
            <div class="col">
                <h1>{{ pageTitle }}</h1>
            </div>
        </div>
    </article>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Page } from '@views/mixins/Page'

import Constants from '@common/Constants'
import { AppContext } from '@web/entryServer'

@Component
export default class Error404Page extends Mixins(Page) {
    getPageTitle = 'Page Not Found'

    created(): void {
        if (Constants.IS_SSR) {
            const ssrContext = this.$ssrContext as AppContext
            ssrContext.statusCode = 404
        }
    }
}
</script>
