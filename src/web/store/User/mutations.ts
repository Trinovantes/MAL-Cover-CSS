import { UserResponse } from '@/common/schemas/ApiResponse'
import { MutationTree } from 'vuex'
import { createDefaultUserState, UserState } from '.'

// ----------------------------------------------------------------------------
// Interfaces
// ----------------------------------------------------------------------------

export enum UserMutation {
    RESET_STATE = 'RESET_STATE',
    SET_USER = 'SET_USER',
}

// ----------------------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------------------

export interface UserMutations {
    [UserMutation.RESET_STATE]: (state: UserState, payload?: UserState) => void
    [UserMutation.SET_USER]: (state: UserState, payload?: UserResponse | null) => void
}

export const mutations: MutationTree<UserState> & UserMutations = {
    [UserMutation.RESET_STATE]: (state: UserState, payload?: UserState) => {
        Object.assign(state, payload ?? createDefaultUserState())
    },

    [UserMutation.SET_USER]: (state: UserState, payload?: UserResponse | null) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.currentUser = payload
    },
}
