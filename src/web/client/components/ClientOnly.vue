<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const show = ref(false)
onMounted(() => {
    show.value = true
})
</script>

<template>
    <template v-if="show">
        <slot />
    </template>
</template>
