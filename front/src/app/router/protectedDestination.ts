import type { Router } from 'vue-router';

export const protectedDestination = (router: Router, value: unknown): string => {
    if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//'))
        return '/almacen';

    const resolved = router.resolve(value);
    return resolved.matched.some((record) => record.meta.requiresAuth)
        ? resolved.fullPath
        : '/almacen';
};
