<template>
    <Header />
    <main class="page">
        <router-view />
    </main>
    <Footer />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue'

export default defineComponent({
    components: {
        Header: defineAsyncComponent(() => import('./Header.vue')),
        Footer: defineAsyncComponent(() => import('./Footer.vue')),
    },
})
</script>

<style lang="scss">
main.page{
    min-height: 100vh;
    padding-top: $header-height;
}

.container{
    margin-left: auto;
    margin-right: auto;
    max-width: $max-page-width;
    padding-left: $padding * 2;
    padding-right: $padding * 2;
    width: 80%;

    @media (max-width: $mobile-breakpoint) {
        width: 100%;
    }
}

.text-container{
    padding-top: $vspace;
    padding-bottom: $vspace;

    display: grid;
    gap: $column-gap;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);

    &.full{
        grid-template-columns: minmax(0, 1fr);
    }

    &.left-sidebar{
        grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    }

    @media (max-width: $mobile-breakpoint) {
        grid-template-columns: minmax(0, 1fr);
    }

    > h1{
        grid-column: 1 / -1;
        margin: 0;
    }

    .q-img{
        border: math.div($padding, 2) solid $light-on-light;
        border-radius: math.div($padding, 4);
        display: block;
    }
}
</style>
