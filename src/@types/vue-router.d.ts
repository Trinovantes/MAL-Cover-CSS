import { ROUTE_META_KEY } from '@/web/client/router/routes'

declare module 'vue-router' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    export interface RouteMeta {
        [ROUTE_META_KEY.REQUIRE_AUTH]?: boolean
    }
}
