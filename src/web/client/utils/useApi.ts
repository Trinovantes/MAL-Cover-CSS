import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/User/useUserStore'

export function useApi() {
    const $q = useQuasar()
    const userStore = useUserStore()
    const router = useRouter()

    const notifyError = (message: string) => {
        $q.notify({
            message,
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

    const login = async() => {
        const { data, error } = await userStore.login(router.currentRoute.value.path)
        if (error) {
            notifyError(error.errorMessage)
            return
        }

        window.location.href = data.url
    }

    const logout = async() => {
        const { data, error } = await userStore.logout()
        if (error) {
            notifyError(error.errorMessage)
            return
        }

        notifySuccess(data.message)
    }

    const deleteUser = async() => {
        const { data, error } = await userStore.deleteUser()
        if (error) {
            notifyError(error.errorMessage)
            return
        }

        notifySuccess(data.message)
    }

    return {
        login,
        logout,
        deleteUser,
    }
}
