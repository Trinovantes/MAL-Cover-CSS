<script lang="ts" setup>
defineProps({
    href: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        default: 'inherit',
    },
})
</script>

<template>
    <span class="external-link">
        <a
            :href="href"
            :title="href"
            target="_blank"
            rel="noopener"
            :style="{
                color: color,
            }"
        >
            <slot />
        </a>

        <q-icon
            name="open_in_new"
            :color="color"
        />
    </span>
</template>

<style lang="scss" scoped>
span.external-link{
    align-items: center;
    display: inline-flex !important;

    .q-icon{
        margin-left: math.div($padding, 4);
    }
}
</style>
