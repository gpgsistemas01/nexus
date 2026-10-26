import { PUBLIC_CATALOGS } from '@nexus/catalogs';
import { PERMISSIONS } from '@nexus/permissions';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouterHistory } from 'vue-router';
import { createAuthSession } from '../../modules/auth/session.js';
import type { AuthSession } from '../../modules/auth/session.js';
import { APP_NAVIGATION_GROUPS } from '../navigation.js';
import { ApiError } from '../../shared/http/apiError.js';
import { MOVEMENT_CONFIG } from '../../modules/movements/movement.js';
import { ISSUE_CONFIG } from '../../modules/issues/issueConfig.js';
import { PURCHASE_CONFIG } from '../../modules/purchases/purchaseConfig.js';

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
                meta: { requiresAuth: true, navigationGroup: 'warehouse' },
                component: () => import('../layouts/AppLayout.vue'),
                children: [
                    {
                        path: '',
                        name: 'warehouse-home',
                        component: () => import('../pages/InventoryWorkspace.vue'),
                        props: { resource: 'materials' },
                    },
                    {
                        path: 'materiales',
                        name: 'materials',
                        meta: { permission: PERMISSIONS.MATERIALS_READ },
                        component: () => import('../pages/InventoryWorkspace.vue'),
                        props: { resource: 'materials' },
                    },
                    {
                        path: 'consumibles',
                        name: 'consumables',
                        meta: { permission: PERMISSIONS.MATERIALS_READ },
                        component: () => import('../pages/InventoryWorkspace.vue'),
                        props: { resource: 'consumables' },
                    },
                    {
                        path: 'mermas',
                        name: 'wastes',
                        meta: { permission: PERMISSIONS.WASTES_PAGE_VIEW },
                        component: () => import('../pages/InventoryWorkspace.vue'),
                        props: { resource: 'wastes' },
                    },
                ],
            },
            {
                path: '/compras',
                meta: {
                    requiresAuth: true,
                    permission: PERMISSIONS.GOODS_RECEIPTS_PAGE_VIEW,
                    navigationGroup: 'purchases',
                },
                component: () => import('../layouts/AppLayout.vue'),
                children: [
                    {
                        path: '',
                        name: 'purchases-home',
                        component: () => import('../pages/PurchaseWorkspace.vue'),
                        props: { resource: 'materials' },
                    },
                    ...Object.entries(PURCHASE_CONFIG).map(([resource, config]) => ({
                        path: config.path,
                        name: `purchases-${resource}`,
                        component: () => import('../pages/PurchaseWorkspace.vue'),
                        props: { resource },
                    })),
                ],
            },
            {
                path: '/salidas',
                meta: { requiresAuth: true, navigationGroup: 'issues' },
                component: () => import('../layouts/AppLayout.vue'),
                children: [
                    {
                        path: '',
                        name: 'issues-home',
                        component: () => import('../pages/IssueWorkspace.vue'),
                        props: { resource: 'materials' },
                    },
                    ...Object.entries(ISSUE_CONFIG).map(([resource, config]) => ({
                        path: config.path,
                        name: `issues-${resource}`,
                        meta: { permission: config.pagePermission },
                        component: () => import('../pages/IssueWorkspace.vue'),
                        props: { resource },
                    })),
                ],
            },
            {
                path: '/movimientos',
                meta: {
                    requiresAuth: true,
                    navigationGroup: 'movements',
                    permission: PERMISSIONS.MOVEMENTS_READ,
                },
                component: () => import('../layouts/AppLayout.vue'),
                children: [
                    {
                        path: '',
                        name: 'movements-home',
                        component: () => import('../../modules/movements/pages/MovementPage.vue'),
                        props: { resource: 'materials' },
                    },
                    ...Object.entries(MOVEMENT_CONFIG).map(([resource, config]) => ({
                        path: config.path,
                        name: `movements-${resource}`,
                        component: () => import('../../modules/movements/pages/MovementPage.vue'),
                        props: { resource },
                    })),
                ],
            },
            {
                path: '/identidad',
                meta: { requiresAuth: true, navigationGroup: 'identity' },
                component: () => import('../layouts/AppLayout.vue'),
                children: [
                    {
                        path: '',
                        name: 'identity-home',
                        component: () => import('../../modules/identity/pages/IdentityPage.vue'),
                        props: { resource: 'persons' },
                    },
                    {
                        path: 'personas',
                        name: 'persons',
                        meta: { permission: PERMISSIONS.PERSONS_PAGE_VIEW },
                        component: () => import('../../modules/identity/pages/IdentityPage.vue'),
                        props: { resource: 'persons' },
                    },
                    {
                        path: 'usuarios',
                        name: 'users',
                        meta: { permission: PERMISSIONS.USERS_MANAGE },
                        component: () => import('../../modules/identity/pages/IdentityPage.vue'),
                        props: { resource: 'users' },
                    },
                ],
            },
            {
                path: '/directorio',
                meta: { requiresAuth: true, navigationGroup: 'directory' },
                component: () => import('../layouts/AppLayout.vue'),
                children: [
                    {
                        path: '',
                        name: 'directory-home',
                        component: () => import('../../modules/directory/pages/DirectoryPage.vue'),
                        props: { resource: 'clients' },
                    },
                    {
                        path: 'clientes',
                        name: 'clients',
                        meta: { permission: PERMISSIONS.CLIENTS_PAGE_VIEW },
                        component: () => import('../../modules/directory/pages/DirectoryPage.vue'),
                        props: { resource: 'clients' },
                    },
                    {
                        path: 'proveedores',
                        name: 'suppliers',
                        meta: { permission: PERMISSIONS.SUPPLIERS_PAGE_VIEW },
                        component: () => import('../../modules/directory/pages/DirectoryPage.vue'),
                        props: { resource: 'suppliers' },
                    },
                ],
            },
            {
                path: '/catalogos',
                meta: {
                    requiresAuth: true,
                    permission: PERMISSIONS.CATALOGS_MANAGE,
                    navigationGroup: 'catalogs',
                },
                component: () => import('../layouts/AppLayout.vue'),
                children: [
                    { path: '', redirect: { name: 'catalog-departments' } },
                    ...Object.keys(PUBLIC_CATALOGS).map((catalog) => ({
                        path: catalog,
                        name: `catalog-${catalog}`,
                        component: () => import('../../modules/catalogs/pages/CatalogPage.vue'),
                        props: { catalog },
                    })),
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

            if (
                [
                    'warehouse-home',
                    'identity-home',
                    'directory-home',
                    'movements-home',
                    'purchases-home',
                    'issues-home',
                ].includes(String(to.name))
            ) {
                const groups = APP_NAVIGATION_GROUPS.filter(
                    (group) => to.name === 'warehouse-home' || group.id === to.meta.navigationGroup,
                );
                const first = groups
                    .flatMap((group) => group.links)
                    .find((link) => user.permissions.includes(link.permission));
                return first
                    ? { path: first.to }
                    : { name: 'forbidden', query: { returnTo: to.fullPath } };
            }

            if (
                typeof to.meta.permission === 'string' &&
                !user.permissions.includes(to.meta.permission)
            )
                return { name: 'forbidden', query: { returnTo: to.fullPath } };
        } catch (cause) {
            return cause instanceof ApiError && cause.status === 401
                ? { name: 'login', query: { returnTo: to.fullPath } }
                : { name: 'session-unavailable', query: { returnTo: to.fullPath } };
        }
    });
    return router;
};
