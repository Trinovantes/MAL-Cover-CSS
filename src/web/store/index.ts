import Vue from 'vue'
import Vuex, { Store } from 'vuex'
Vue.use(Vuex)

import { ErrorResponse, UserResponse } from '@api/interfaces/Responses'
import { fetchUser } from '@web/store/api'

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export interface IRootState {
    currentUser?: UserResponse
    error?: ErrorResponse
}

export function createDefaultState(): IRootState {
    return {
        //
    }
}

export function createStore(): Store<IRootState> {
    const store = new Store<IRootState>({
        // Checks state changes only happen in mutation handlers
        strict: DEFINE.IS_DEV,

        state: createDefaultState,

        mutations: {
            logoutUser(state): void {
                state.currentUser = undefined
            },

            setCurrentUser(state, currentUser: UserResponse): void {
                state.currentUser = currentUser
            },

            setError(state, error?: ErrorResponse): void {
                state.error = error
            },
        },

        actions: {
            async fetchUser({ commit }): Promise<void> {
                const currentUser = await fetchUser()
                commit('setCurrentUser', currentUser)
            },
        },
    })

    return store
}
