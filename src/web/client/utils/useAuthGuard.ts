import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { RouteName } from '../router/routes'
import { useUserStore } from '../store/User'

export function useAuthGuard() {
    const router = useRouter()
    const userStore = useUserStore()
    const currentUser = computed(() => userStore.currentUser)

    watch(currentUser, async() => {
        if (currentUser.value) {
            return
        }

        await router.push(RouteName.Home)
    }, {
        immediate: true,
    })
}
