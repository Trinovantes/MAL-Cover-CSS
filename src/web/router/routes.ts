import { RouteRecordRaw } from 'vue-router'

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('@/web/layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                component: () => import('@/web/pages/HomePage.vue'),
            },
            {
                path: 'guide',
                component: () => import('@/web/pages/GuidePage.vue'),
            },
            {
                path: 'example',
                component: () => import('@/web/pages/ExamplePage.vue'),
            },
            {
                path: 'classic-vs-modern',
                component: () => import('@/web/pages/ClassicVsModernPage.vue'),
            },
            {
                path: 'settings',
                component: () => import('@/web/pages/SettingsPage.vue'),
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: {
            path: '/',
        },
    },
]
