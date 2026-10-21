import { PERMISSIONS } from '@nexus/permissions';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouterHistory } from 'vue-router';
import { createAuthSession } from '../../modules/auth/session.js';
import type { AuthSession } from '../../modules/auth/session.js';
import { ApiError } from '../../shared/services/apiClient.js';

export const createAppRouter = (
    history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
    session: AuthSession = createAuthSession(),
) => {
    const router = createRouter({
        history,
        routes: [
            { path: '/', redirect: { name: 'login' } },
            {
                path: '/inicio-sesion',
                name: 'login',
                component: () => import('../../modules/auth/pages/LoginPage.vue'),
            },
            {
                path: '/almacen',
                meta: { requiresAuth: true },
                component: () => import('../../modules/warehouse/pages/WarehouseLayout.vue'),
                children: [
                    {
                        path: '',
                        name: 'warehouse-home',
                        component: () => import('../../modules/warehouse/pages/InventoryPage.vue'),
                        props: { resource: 'materials' },
                    },
                    {
                        path: 'materiales',
                        name: 'materials',
                        meta: { permission: PERMISSIONS.MATERIALS_READ },
                        component: () => import('../../modules/warehouse/pages/InventoryPage.vue'),
                        props: { resource: 'materials' },
                    },
                    {
                        path: 'consumibles',
                        name: 'consumables',
                        meta: { permission: PERMISSIONS.MATERIALS_READ },
                        component: () => import('../../modules/warehouse/pages/InventoryPage.vue'),
                        props: { resource: 'consumables' },
                    },
                    {
                        path: 'mermas',
                        name: 'wastes',
                        meta: { permission: PERMISSIONS.WASTES_PAGE_VIEW },
                        component: () => import('../../modules/warehouse/pages/InventoryPage.vue'),
                        props: { resource: 'wastes' },
                    },
                ],
            },
            {
                path: '/sin-permiso',
                name: 'forbidden',
                component: () => import('../pages/AccessErrorPage.vue'),
            },
            {
                path: '/sesion-no-disponible',
                name: 'session-unavailable',
                props: { isUnavailable: true },
                component: () => import('../pages/AccessErrorPage.vue'),
            },
            {
                path: '/:pathMatch(.*)*',
                name: 'not-found',
                component: () => import('../pages/NotFoundPage.vue'),
            },
        ],
    });
    router.beforeEach(async (to) => {
        if (!to.matched.some((record) => record.meta.requiresAuth)) return;
        try {
            const user = await session.load();
            if (to.name === 'warehouse-home')
                return {
                    name: user.permissions.includes(PERMISSIONS.MATERIALS_READ)
                        ? 'materials'
                        : user.permissions.includes(PERMISSIONS.WASTES_PAGE_VIEW)
                          ? 'wastes'
                          : 'forbidden',
                };
            if (
                typeof to.meta.permission === 'string' &&
                !user.permissions.includes(to.meta.permission)
            )
                return { name: 'forbidden' };
        } catch (cause) {
            return cause instanceof ApiError && cause.status === 401
                ? { name: 'login', query: { returnTo: to.fullPath } }
                : { name: 'session-unavailable' };
        }
    });
    return router;
};
