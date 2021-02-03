<template>
    <main id="main-layout">
        <Header />
        <router-view class="content" />
        <Footer />
    </main>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'

@Component({
    components: {
        Header: () => import('@views/layouts/Header.vue'),
        Footer: () => import('@views/layouts/Footer.vue'),
    },
})
export default class MainLayout extends Mixins(Vue) {
    // nop
}
</script>

<style lang="scss">
#main-layout{
    display: flex;
    flex-direction: column;
    min-height: 100vh;

    > .content{
        flex: 1;
        padding: ($padding * 8) 0;

        .row{
            padding: 0 $padding;
        }
    }
}
</style>
