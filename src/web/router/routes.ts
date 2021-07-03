import { RouteRecordRaw } from 'vue-router'

export const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: () => import('@/web/layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                component: () => import('@/web/pages/Home/HomePage.vue'),
            },
            {
                path: 'guide',
                component: () => import('@/web/pages/Guide/GuidePage.vue'),
            },
            {
                path: 'example',
                component: () => import('@/web/pages/Example/ExamplePage.vue'),
            },
            {
                path: 'classic-vs-modern',
                component: () => import('@/web/pages/ClassicVsModern/ClassicVsModernPage.vue'),
            },
            {
                path: 'settings',
                component: () => import('@/web/pages/Settings/SettingsPage.vue'),
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
