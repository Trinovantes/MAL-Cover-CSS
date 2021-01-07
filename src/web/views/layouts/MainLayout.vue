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
