import { useRouter } from 'vue-router';
import { useAuthSession } from '../../modules/auth/session.js';
import { ApiError } from '../../shared/http/apiError.js';

// La política de navegación pertenece a la aplicación, no a los componentes visuales.
export const usePageAccess = () => {
    const session = useAuthSession();
    const router = useRouter();

    const has = (permission: string) => !!session.user.value?.permissions.includes(permission);

    const onDenied = (status: number) => {
        if (status !== 401 && status !== 403) return;

        void router.replace(
            status === 401
                ? { name: 'login', query: { returnTo: router.currentRoute.value.fullPath } }
                : { name: 'forbidden', query: { returnTo: router.currentRoute.value.fullPath } },
        );
    };

    const onError = (cause: unknown) => {
        if (cause instanceof ApiError) onDenied(cause.status);
    };

    return { session, has, onDenied, onError };
};
