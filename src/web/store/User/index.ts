import { InjectionKey } from 'vue'
import { CommitOptions, createStore, DispatchOptions, Store, useStore } from 'vuex'
import { mutations, UserMutations } from './mutations'
import { actions, UserActions } from './actions'
import { UserResponse } from '@/common/schemas/ApiResponse'

// ----------------------------------------------------------------------------
// Store
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

export function createUserStore(): Store<UserState> {
    const store = createStore<UserState>({
        strict: DEFINE.IS_DEV,

        state: createDefaultUserState,
        mutations,
        actions,
    })

    return store
}

// ----------------------------------------------------------------------------
// TypeScript Helpers
// ----------------------------------------------------------------------------

type TypedStore = Omit<Store<UserState>, 'commit' | 'dispatch' | 'getters'> & {
    commit<K extends keyof UserMutations>(
        key: K,
        payload?: Parameters<UserMutations[K]>[1],
        options?: CommitOptions
    ): ReturnType<UserMutations[K]>
} & {
    dispatch<K extends keyof UserActions>(
        key: K,
        payload?: Parameters<UserActions[K]>[1],
        options?: DispatchOptions
    ): ReturnType<UserActions[K]>
}

export const userInjectionKey: InjectionKey<TypedStore> = Symbol('Vuex (User) InjectionKey')

export function useUserStore(): TypedStore {
    return useStore(userInjectionKey)
}
