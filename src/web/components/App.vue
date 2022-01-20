<script lang="ts">
import { defineComponent } from 'vue'
import { useUserStore } from '@/web/store/User'
import { UserAction } from '@/web/store/User/actions'
import { UserMutation } from '@/web/store/User/mutations'

export default defineComponent({
    async setup() {
        const userStore = useUserStore()
        try {
            await userStore.dispatch(UserAction.INIT)
        } catch (err) {
            userStore.commit(UserMutation.RESET_STATE)
        }
    },
})
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
