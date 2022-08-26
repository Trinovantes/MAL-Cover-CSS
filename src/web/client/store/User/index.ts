import { defineStore } from 'pinia'
import { fetchDeleteUser, fetchLogin, fetchLogout, fetchUser } from '../../services/api'
import { HydrationKey, loadStateFromDom } from '../Hydration'
import type { AppContext } from '@/web/AppContext'
import type { ErrorResponse, RedirectResponse, SuccessResponse, UserResponse } from '@/web/server/schemas/ApiResponse'

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

export interface UserState {
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
        async init(appContext: AppContext | undefined) {
            if (this.currentUser) {
                return
            }

            const initState = loadStateFromDom(HydrationKey.USER)
            if (initState) {
                this.$patch(initState)
                return
            }

            const user = await fetchUser(appContext)
            this.currentUser = user
        },

        async login(appContext: AppContext | undefined, restorePath: string): Promise<RedirectResponse | ErrorResponse> {
            this.currentUser = null
            const res = await fetchLogin(appContext, restorePath)
            return res
        },

        async logout(appContext: AppContext | undefined): Promise<SuccessResponse | ErrorResponse> {
            const res = await fetchLogout(appContext)
            this.currentUser = null
            return res
        },

        async deleteUser(appContext: AppContext | undefined): Promise<SuccessResponse | ErrorResponse> {
            const res = await fetchDeleteUser(appContext)
            this.currentUser = null
            return res
        },
    },
})
