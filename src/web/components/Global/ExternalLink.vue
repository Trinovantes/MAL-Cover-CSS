<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        href: {
            type: String,
            required: true,
        },
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
        >
            <slot />
        </a>
        <q-icon name="open_in_new" />
    </span>
</template>

<style lang="scss">
span.external-link{
    align-items: center;
    display: inline-flex !important;

    .q-icon{
        margin-left: math.div($padding, 4);
    }
}
</style>
