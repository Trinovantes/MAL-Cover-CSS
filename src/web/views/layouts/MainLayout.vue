<template>
    <main id="main-layout">
        <Header />
        <router-view class="content" />
        <Footer />
    </main>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
    components: {
        Header: () => import('./Header.vue'),
        Footer: () => import('./Footer.vue'),
    },
})
export default class MainLayout extends Vue {
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
