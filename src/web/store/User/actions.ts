import { ActionContext, ActionTree } from 'vuex'
import { UserState } from '.'
import { fetchUser } from '@/web/utils/api'
import { UserMutations, UserMutation } from './mutations'

// ----------------------------------------------------------------------------
// Interfaces
// ----------------------------------------------------------------------------

export enum UserAction {
    INIT = 'INIT',
}

// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------

type TypedActionContext = Omit<ActionContext<UserState, UserState>, 'commit' | 'dispatch' | 'getters' | 'rootState' | 'rootGetters'> & {
    commit<K extends keyof UserMutations>(
        key: K,
        payload?: Parameters<UserMutations[K]>[1]
    ): ReturnType<UserMutations[K]>

    // eslint-disable-next-line no-use-before-define
    dispatch<K extends keyof UserActions>(
        key: K,
        // eslint-disable-next-line no-use-before-define
        payload?: Parameters<UserActions[K]>[1]
    // eslint-disable-next-line no-use-before-define
    ): ReturnType<UserActions[K]>
}

export interface UserActions {
    [UserAction.INIT]: (context: TypedActionContext) => Promise<void>
}

export const actions: ActionTree<UserState, UserState> & UserActions = {
    [UserAction.INIT]: async({ commit }) => {
        // Don't load user from api during prerender
        if (DEFINE.IS_PRERENDER) {
            return
        }

        const user = await fetchUser()
        commit(UserMutation.SET_USER, user)
    },
}
