<template>
    <article class="container text-container">
        <h1>
            {{ title }}
        </h1>

        <ClientOnly>
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
                />

                <div class="callout">
                    <h3>
                        Unlink Account
                    </h3>
                    <p>
                        This will delete all of your account information from this website and your profile will no longer be checked.
                        You may continue to use the generated CSS but they may no longer style everything in your lists.
                    </p>
                    <q-btn
                        color="negative"
                        label="Unlink Account"
                        unelevated
                        no-caps
                        @click="onClickUnlinkAccount"
                    />
                </div>
            </section>
        </ClientOnly>
    </article>
</template>

<script lang="ts">
import { createPageHeadOptions } from '@/web/utils/PageHeadOptions'
import { useQuasar } from 'quasar'
import { computed, defineComponent, onMounted } from 'vue'
import { useMeta } from 'vue-meta'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/web/store/User'
import { fetchDeleteUser } from '@/web/utils/api'
import { UserMutation } from '@/web/store/User/mutations'
import dayjs from 'dayjs'

export default defineComponent({
    setup() {
        const title = 'Settings'

        useMeta(computed(() => {
            return createPageHeadOptions({
                title,
            })
        }))

        const userStore = useUserStore()
        const currentUser = computed(() => userStore.state.currentUser)
        const username = computed(() => currentUser.value?.malUsername)
        const lastChecked = computed(() => {
            if (!currentUser.value?.lastChecked) {
                return 'N/A'
            }

            return dayjs.utc(currentUser.value.lastChecked).fromNow()
        })
        const lastCheckedTitle = computed(() => {
            if (!currentUser.value?.lastChecked) {
                return 'N/A'
            }

            return dayjs.utc(currentUser.value.lastChecked).tz(dayjs.tz.guess()).format('LLL')
        })
        const lastCheckedHint = computed(() => {
            if (currentUser.value?.lastChecked) {
                return 'The generated CSS now includes entries from your anime and manga lists.'
            } else {
                return 'Your profile has not been checked yet. The bot runs once every hour. Please check back again in about an hour.'
            }
        })

        const $q = useQuasar()
        const router = useRouter()
        const onClickUnlinkAccount = async() => {
            try {
                const success = await fetchDeleteUser()
                $q.notify({
                    message: success.message,
                    type: 'positive',
                    position: 'top',
                    actions: [{
                        icon: 'close',
                        color: 'white',
                    }],
                })

                userStore.commit(UserMutation.RESET_STATE)
                await router.push('/')
            } catch (err) {
                console.warn('Failed to unlink account')
                console.warn(err)
            }
        }

        onMounted(async() => {
            if (!currentUser.value) {
                await router.push('/')
            }
        })

        return {
            title,
            currentUser,
            username,
            lastChecked,
            lastCheckedTitle,
            lastCheckedHint,
            onClickUnlinkAccount,
        }
    },
})
</script>
