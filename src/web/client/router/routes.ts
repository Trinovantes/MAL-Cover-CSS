import type { RouteRecordRaw } from 'vue-router'

export const enum RouteName {
    Home = 'Home',
    Settings = 'Settings',
    Error404 = 'Error404',
}

export enum RouteMetaKey {
    RequireUnauth = 'RequireUnauth',
    RequireAuth = 'RequireAuth',
}

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: RouteName.Home,
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
                name: RouteName.Settings,
                component: () => import('../pages/Settings/SettingsPage.vue'),
                meta: {
                    [RouteMetaKey.RequireAuth]: true,
                },
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        name: RouteName.Error404,
        redirect: {
            name: RouteName.Home,
        },
    },
]
