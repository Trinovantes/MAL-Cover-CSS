<template>
    <slot v-if="isNotPrerender" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    setup() {
        const isNotPrerender = !DEFINE.IS_PRERENDER

        return {
            isNotPrerender,
        }
    },
})
</script>
