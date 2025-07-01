import { defineStore } from 'pinia'
import { loadStateFromWindow } from '../Hydration.ts'
import type { RedirectResponse, SuccessResponse, UserResponse } from '../../../server/interfaces/ApiResponse.ts'
import type { AppContext } from '../../../AppContext.ts'
import { fetchWithSsrProxy } from '../../utils/fetchWithSsrProxy.ts'
import type { LoginPayload } from '../../../server/interfaces/LoginPayload.ts'

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

            if (!__IS_SSR__) {
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
