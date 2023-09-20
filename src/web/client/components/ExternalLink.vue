<script lang="ts" setup>
defineProps<{
    href: string
    dark?: boolean
}>()
</script>

<template>
    <a
        :href="href"
        :title="href"
        target="_blank"
        rel="noopener"
        class="external-link"
        :class="{
            dark
        }"
    >
        <slot />

        <q-icon
            name="open_in_new"
            :class="{
                dark
            }"
        />
    </a>
</template>

<style lang="scss" scoped>
a.external-link{
    display: inline-flex;
    align-items: center;

    .q-icon{
        margin-left: math.div($padding, 4);
    }
}
</style>
