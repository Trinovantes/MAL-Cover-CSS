import type { RouteRecordRaw } from 'vue-router'

export enum RouteName {
    Home = 'Home',
    Settings = 'Settings',
    Error404 = 'Error404',
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
