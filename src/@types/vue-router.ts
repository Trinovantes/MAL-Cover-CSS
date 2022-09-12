import type { RouteMetaKey } from '@/web/client/router/routes'

declare module 'vue-router' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    export interface RouteMeta {
        [RouteMetaKey.RequireAuth]?: boolean
        [RouteMetaKey.RequireUnauth]?: boolean
    }
}
