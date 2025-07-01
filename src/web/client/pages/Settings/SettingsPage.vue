<script lang="ts" setup>
import { computed } from 'vue'
import { useSeoMeta } from '@unhead/vue'
import { useUserStore } from '../../store/User/useUserStore.ts'
import { getRelativeTime } from '../../../../common/utils/getRelativeTime.ts'
import { useApi } from '../../utils/useApi.ts'

const title = 'Settings'
useSeoMeta({ title })

const userStore = useUserStore()
const currentUser = computed(() => userStore.user)
const username = computed(() => currentUser.value?.malUsername)
const lastChecked = computed(() => {
    if (!currentUser.value?.lastChecked) {
        return 'N/A'
    }

    return getRelativeTime(currentUser.value.lastChecked)
})
const lastCheckedTitle = computed(() => {
    if (!currentUser.value?.lastChecked) {
        return 'N/A'
    }

    return new Date(currentUser.value.lastChecked).toISOString()
})
const lastCheckedHint = computed(() => {
    if (currentUser.value?.lastChecked) {
        return 'The generated CSS now includes entries from your anime and manga lists.'
    } else {
        return 'Your profile has not been checked yet. The bot runs once every hour. Please check back again in about an hour.'
    }
})

const { deleteUser } = useApi()
</script>

<template>
    <article class="container text-container">
        <h1>
            {{ title }}
        </h1>

        <section v-if="currentUser">
            <q-input
                readonly
                outlined
                label="MyAnimeList Username"
                :model-value="username"
            />

            <q-input
                readonly
                outlined
                label="Last Checked"
                :model-value="lastChecked"
                :title="lastCheckedTitle"
                :hint="lastCheckedHint"
                :hide-bottom-space="true"
            />

            <div class="callout">
                <h3>
                    Unlink Account
                </h3>

                <p>
                    This will delete all of your account information from this website and your profile will no longer be checked.
                    You may continue to use the generated CSS but they may no longer style everything in your lists.
                </p>

                <div class="flex-hgap">
                    <q-btn
                        color="negative"
                        label="Unlink Account"
                        title="Unlink Account"
                        unelevated
                        no-caps
                        @click="deleteUser"
                    />
                </div>
            </div>
        </section>
    </article>
</template>
