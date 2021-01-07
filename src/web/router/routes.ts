import { RouteConfig } from 'vue-router'

const routes: Array<RouteConfig> = [
    {
        path: '/',
        component: () => import('@views/layouts/MainLayout.vue'),
        children: [
            {
                name: 'guide',
                path: 'guide',
                component: () => import('@views/pages/GuidePage.vue'),
            },
            {
                name: 'settings',
                path: 'settings',
                component: () => import('@views/pages/SettingsPage.vue'),
            },
            {
                name: 'home',
                path: '',
                component: () => import('@views/pages/HomePage.vue'),
            },
            {
                name: '404',
                path: '*',
                component: () => import('@views/pages/404.vue'),
            },
        ],
    },
]

export default routes
