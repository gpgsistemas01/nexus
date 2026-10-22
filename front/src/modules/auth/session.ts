import { inject, readonly, shallowRef } from 'vue';
import type { InjectionKey } from 'vue';
import { isRecord } from '../../shared/utils/isRecord.js';
import { apiClient } from '../../shared/http/apiClient.js';

export interface SessionUser {
    id: string;
    name: string;
    permissions: readonly string[];
}

export const createAuthSession = (request = apiClient.request) => {
    const user = shallowRef<SessionUser | null>(null);
    let loading: Promise<SessionUser> | null = null;

    const load = async () => {
        loading ??= request<{ user: unknown }>('/api/auth/me')
            .then((data) => {
                if (
                    !isRecord(data.user) ||
                    typeof data.user.id !== 'string' ||
                    typeof data.user.name !== 'string' ||
                    !Array.isArray(data.user.permissions) ||
                    !data.user.permissions.every((p) => typeof p === 'string')
                ) {
                    throw new Error('No fue posible comprobar la sesión.');
                }

                user.value = {
                    id: data.user.id,
                    name: data.user.name,
                    permissions: data.user.permissions,
                };
                return user.value;
            })
            .catch((error) => {
                user.value = null;
                throw error;
            })
            .finally(() => {
                loading = null;
            });
        return loading;
    };

    return { user: readonly(user), load };
};

export type AuthSession = ReturnType<typeof createAuthSession>;
export const authSessionKey: InjectionKey<AuthSession> = Symbol('auth-session');

export const useAuthSession = () => {
    const session = inject(authSessionKey);
    if (!session) throw new Error('La sesión no se ha configurado.');

    return session;
};
