import { defineStore } from 'pinia'
import { fetchDeleteUser, fetchLogin, fetchLogout, fetchUser } from '../../services/api'
import { HydrationKey, loadStateFromDom } from '../hydration'
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
        async init() {
            if (!DEFINE.IS_SSR) {
                const savedState = loadStateFromDom(HydrationKey.USER)
                if (!savedState) {
                    throw new Error(`Missing ${HydrationKey.USER}`)
                }

                this.$patch(savedState)
                return
            }

            const user = await fetchUser()
            this.currentUser = user
        },

        async login(restorePath: string): Promise<RedirectResponse | ErrorResponse> {
            this.currentUser = null
            const res = await fetchLogin(restorePath)
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
