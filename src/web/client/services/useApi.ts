import { useQuasar } from 'quasar/src/index.all'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/User'
import { useAppContext } from '@/web/AppContext'

type Handler = () => Promise<void>

export function useApi(): { login: Handler; logout: Handler; unlinkAccount: Handler } {
    const $q = useQuasar()
    const notifyError = (message: string) => {
        $q.notify({
            message: DEFINE.IS_DEV ? `<pre>${message}</pre>` : message,
            html: DEFINE.IS_DEV,
            timeout: DEFINE.IS_DEV ? 0 : undefined,
            type: 'negative',
            position: 'top',
            actions: [{
                icon: 'close',
                color: 'white',
            }],
        })
    }
    const notifySuccess = (message: string) => {
        $q.notify({
            message,
            type: 'positive',
            position: 'top',
            actions: [{
                icon: 'close',
                color: 'white',
            }],
        })
    }

    const userStore = useUserStore()
    const router = useRouter()
    const appContext = useAppContext()
    const login = async() => {
        const res = await userStore.login(appContext, router.currentRoute.value.path)

        if ('errorMessage' in res) {
            notifyError(res.errorMessage)
        } else {
            window.location.href = res.url
        }
    }
    const logout = async() => {
        const res = await userStore.logout(appContext)

        if ('errorMessage' in res) {
            notifyError(res.errorMessage)
        } else {
            notifySuccess(res.message)
        }
    }
    const unlinkAccount = async() => {
        const res = await userStore.deleteUser(appContext)

        if ('errorMessage' in res) {
            notifyError(res.errorMessage)
        } else {
            notifySuccess(res.message)
        }
    }

    return {
        login,
        logout,
        unlinkAccount,
    }
}
