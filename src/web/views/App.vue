<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { VuexAccessor } from '@views/mixins/VuexAccessor'

import { AppContext } from '@web/entryServer'

@Component
export default class App extends Mixins(VuexAccessor) {
    serverPrefetch(): void {
        const ssrContext = this.$ssrContext as AppContext
        const session = ssrContext.req.session

        if (session.currentUser) {
            this.setCurrentUser(session.currentUser)
        }

        if (session.error) {
            this.setError(session.error)
            session.error = undefined
        }
    }

    mounted(): void {
        if (this.error) {
            this.$q.notify({
                type: 'negative',
                message: this.error.errorMessage,
                position: 'top',
                actions: [{
                    icon: 'close',
                    color: 'white',
                }],
            })
        }
    }
}
</script>

<style lang="scss">
html,
body,
#app{
    min-height: 100vh;
}
</style>
