import type { RouteMetaKey } from '@/web/client/router/routes'

declare module 'vue-router' {
    export interface RouteMeta {
        [RouteMetaKey.RequireAuth]?: boolean
        [RouteMetaKey.RequireUnauth]?: boolean
    }
}
