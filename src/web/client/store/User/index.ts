import { defineStore } from 'pinia'
import { fetchDeleteUser, fetchLogin, fetchLogout, fetchUser } from '../../services/api'
import { HydrationKey, loadStateFromDom } from '../Hydration'
import type { AppContext } from '@/web/AppContext'
import type { ErrorResponse, RedirectResponse, SuccessResponse, UserResponse } from '@/web/server/schemas/ApiResponse'

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

export type UserState = {
    currentUser: UserResponse | null
}

export function createDefaultUserState(): UserState {
    const defaultState: UserState = {
        currentUser: null,
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
            if (appContext) {
                const user = await fetchUser(appContext)
                this.currentUser = user
            } else {
                const initState = loadStateFromDom(HydrationKey.USER)
                this.$patch(initState ?? {})
            }
        },

        async login(restorePath: string): Promise<RedirectResponse | ErrorResponse> {
            const res = await fetchLogin(restorePath)
            this.currentUser = null
            return res
        },

        async logout(): Promise<SuccessResponse | ErrorResponse> {
            const res = await fetchLogout()
            this.currentUser = null
            return res
        },

        async deleteUser(): Promise<SuccessResponse | ErrorResponse> {
            const res = await fetchDeleteUser()
            this.currentUser = null
            return res
        },
    },
})
