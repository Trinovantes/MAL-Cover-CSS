<template>
    <metainfo>
        <template #title="{ content }">
            {{ content && content !== APP_NAME ? `${content} | ${APP_NAME}` : APP_NAME }}
        </template>
    </metainfo>

    <router-view v-slot="{ Component }">
        <template v-if="Component">
            <suspense @resolve="saveStatesToDom">
                <component :is="Component" />
            </suspense>
        </template>
    </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { APP_NAME } from '@/common/Constants'
import { useUserStore } from '@/web/store/User'
import { UserAction } from '@/web/store/User/actions'
import { UserMutation } from '@/web/store/User/mutations'

export default defineComponent({
    async setup() {
        const saveStatesToDom = () => {
            document.dispatchEvent(new Event(DEFINE.PRERENDER_READY_EVENT))
        }

        const userStore = useUserStore()
        try {
            await userStore.dispatch(UserAction.INIT)
        } catch (err) {
            console.info('Failed to init User')
            userStore.commit(UserMutation.RESET_STATE)
        }

        return {
            APP_NAME,
            saveStatesToDom,
        }
    },
})
</script>
