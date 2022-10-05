import devalue from '@nuxt/devalue'
import type { UserState } from './User/useUserStore'

export enum HydrationKey {
    USER = '__INITIAL_USER_STATE__',
}

export type HydrationMap = {
    [HydrationKey.USER]: UserState
}

export function saveStateToDom<K extends keyof HydrationMap>(key: K, state: HydrationMap[K]): string {
    return `window.${key} = ${devalue(state)}`
}

export function loadStateFromDom<K extends keyof HydrationMap>(key: K): HydrationMap[K] | undefined {
    if (DEFINE.IS_SSR) {
        return undefined
    }

    return window[key]
}
