import devalue from '@nuxt/devalue'
import { UserState } from './User/useUserStore'

export type HydrationMap = {
    ['UserStore']: UserState
}

export function saveStateToWindow<K extends keyof HydrationMap>(key: K, state: HydrationMap[K]): string {
    return `window.${key} = ${devalue(state)}`
}

export function loadStateFromWindow<K extends keyof HydrationMap>(key: K): HydrationMap[K] | undefined {
    if (DEFINE.IS_SSR) {
        return undefined
    }

    return window[key]
}
