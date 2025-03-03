import { RouteRecordRaw } from 'vue-router'

export const ROUTE_NAME = Object.freeze({
    HOME: 'Home',
    ERROR_404: 'Error404',
})

export const ROUTE_META_KEY = Object.freeze({
    REQUIRE_AUTH: 'RequireAuth',
})

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: ROUTE_NAME.HOME,
                component: () => import('../pages/Home/HomePage.vue'),
            },
            {
                path: 'guide',
                component: () => import('../pages/Guide/GuidePage.vue'),
            },
            {
                path: 'example',
                component: () => import('../pages/Example/ExamplePage.vue'),
            },
            {
                path: 'classic-vs-modern',
                component: () => import('../pages/ClassicVsModern/ClassicVsModernPage.vue'),
            },
            {
                path: 'settings',
                component: () => import('../pages/Settings/SettingsPage.vue'),
                meta: {
                    [ROUTE_META_KEY.REQUIRE_AUTH]: true,
                },
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        name: ROUTE_NAME.ERROR_404,
        component: () => import('../pages/Home/HomePage.vue'),
    },
]
