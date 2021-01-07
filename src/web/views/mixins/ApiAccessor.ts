import Component from 'vue-class-component'
import { VuexAccessor } from './VuexAccessor'
import { AxiosError } from 'axios'

import { fetchDeleteUser, fetchLoginRedirect, fetchLogoutRedirect } from '@web/store/api'

@Component
export class ApiAccessor extends VuexAccessor {
    async onClickLogin(): Promise<void> {
        try {
            const url = await fetchLoginRedirect(this.$route.path)
            window.location.href = url
        } catch (err) {
            const error = err as AxiosError
            console.warn('Failed to log in', error.message)
        }
    }

    async onClickLogout(): Promise<void> {
        try {
            const url = await fetchLogoutRedirect()
            window.location.href = url // Force browser reload so that Vue's state can be reset
        } catch (err) {
            const error = err as AxiosError
            console.warn('Failed to log out', error.message)
        }
    }

    async onClickUnlinkAccount(): Promise<void> {
        try {
            const success = await fetchDeleteUser()
            this.setCurrentUser()

            this.$q.notify({
                message: success.message,
                type: 'positive',
                position: 'top',
                actions: [{
                    icon: 'close',
                    color: 'white',
                }],
            })

            await this.$router.push('/')
        } catch (err) {
            const error = err as AxiosError
            console.warn('Failed to log out', error.message)
        }
    }
}
