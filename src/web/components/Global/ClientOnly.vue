<template>
    <template v-if="show">
        <slot />
    </template>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
    setup() {
        const show = ref(false)
        onMounted(() => {
            show.value = true
        })

        return {
            show,
        }
    },
})
</script>
