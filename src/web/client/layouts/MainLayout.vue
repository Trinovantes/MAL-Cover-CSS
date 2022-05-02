<script lang="ts" setup>
import MainLayoutFooter from './MainLayoutFooter.vue'
import MainLayoutHeader from './MainLayoutHeader.vue'
</script>

<template>
    <MainLayoutHeader
        class="main-layout-header"
    />

    <main class="page full-height-container">
        <router-view />
    </main>

    <MainLayoutFooter
        class="main-layout-footer"
    />
</template>

<style lang="scss" scoped>
main{
    margin-top: $header-height;
}

.main-layout-header{
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 9;
}
</style>
