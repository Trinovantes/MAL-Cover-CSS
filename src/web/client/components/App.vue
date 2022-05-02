<script lang="ts" setup>
import { useUserStore } from '../store/User'

const userStore = useUserStore()
await userStore.init()
</script>

<template>
    <metainfo />

    <router-view v-slot="{ Component }">
        <template v-if="Component">
            <suspense>
                <component :is="Component" />
            </suspense>
        </template>
    </router-view>
</template>
