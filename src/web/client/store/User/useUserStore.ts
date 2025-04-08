import { defineStore } from 'pinia'
import { loadStateFromWindow } from '../Hydration'
import { AppContext } from '@/web/AppContext'
import { RedirectResponse, SuccessResponse, UserResponse } from '@/web/server/interfaces/ApiResponse'
import { fetchWithSsrProxy } from '@/web/client/utils/fetchWithSsrProxy'
import { LoginPayload } from '@/web/server/interfaces/LoginPayload'

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

export type UserState = {
    user: UserResponse | null
}

export function createDefaultUserState(): UserState {
    const defaultState: UserState = {
        user: null,
    }

    return defaultState
}

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export const useUserStore = defineStore('User', {
    state: createDefaultUserState,

    actions: {
        async init(appContext?: AppContext) {
            if (this.user) {
                return
            }

            if (!DEFINE.IS_SSR) {
                const savedState = loadStateFromWindow('__INITIAL_USER_STATE__')
                if (savedState) {
                    this.$patch(savedState)
                    return
                }
            }

            const { data } = await fetchWithSsrProxy<UserResponse>('/api/settings/user', { method: 'GET' }, appContext)
            this.user = data
        },

        async deleteUser() {
            const res = await fetchWithSsrProxy<SuccessResponse>('/api/settings/user', {
                method: 'DELETE',
            })

            this.user = null
            return res
        },

        async login(restorePath: string) {
            const loginPayload: LoginPayload = {
                restorePath,
            }

            const res = await fetchWithSsrProxy<RedirectResponse>('/api/oauth/login', {
                method: 'POST',
                body: JSON.stringify(loginPayload),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            this.user = null
            return res
        },

        async logout() {
            const res = await fetchWithSsrProxy<SuccessResponse>('/api/oauth/logout', {
                method: 'POST',
            })

            this.user = null
            return res
        },
    },
})
