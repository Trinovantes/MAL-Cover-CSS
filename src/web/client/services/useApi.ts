import { useQuasar } from 'quasar/src/index.all'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/User'

type Handler = () => Promise<void>

export function useApi(): { login: Handler; logout: Handler; unlinkAccount: Handler } {
    const userStore = useUserStore()
    const $q = useQuasar()
    const router = useRouter()

    const login = async() => {
        const res = await userStore.login(router.currentRoute.value.path)

        if ('errorMessage' in res) {
            $q.notify({
                message: res.errorMessage,
                type: 'negative',
                position: 'top',
                actions: [{
                    icon: 'close',
                    color: 'white',
                }],
            })
        } else {
            window.location.href = res.url
        }
    }

    const logout = async() => {
        const res = await userStore.logout()

        if ('errorMessage' in res) {
            $q.notify({
                message: res.errorMessage,
                type: 'negative',
                position: 'top',
                actions: [{
                    icon: 'close',
                    color: 'white',
                }],
            })
        } else {
            $q.notify({
                message: res.message,
                type: 'positive',
                position: 'top',
                actions: [{
                    icon: 'close',
                    color: 'white',
                }],
            })
        }
    }

    const unlinkAccount = async() => {
        const res = await userStore.deleteUser()

        if ('errorMessage' in res) {
            $q.notify({
                message: res.errorMessage,
                type: 'negative',
                position: 'top',
                actions: [{
                    icon: 'close',
                    color: 'white',
                }],
            })
        } else {
            $q.notify({
                message: res.message,
                type: 'positive',
                position: 'top',
                actions: [{
                    icon: 'close',
                    color: 'white',
                }],
            })
        }
    }

    return {
        login,
        logout,
        unlinkAccount,
    }
}
