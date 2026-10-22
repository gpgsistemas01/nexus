import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { afterEach, expect, it } from 'vitest';
import { usePageAccess } from '../../../src/app/composables/usePageAccess.js';
import { createAuthSession, authSessionKey } from '../../../src/modules/auth/session.js';
import { apiClient } from '../../../src/shared/http/apiClient.js';
import { ApiError } from '../../../src/shared/http/apiError.js';
import { mockHttpAdapter } from '../../helpers/httpAdapter.js';
import { user } from '../../fixtures/inventory.js';

const adapter = apiClient.http.defaults.adapter;
afterEach(() => {
  apiClient.http.defaults.adapter = adapter;
});

const openPage = async () => {
  let permissions = ['clients:read'];
  apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
    data: { user: { ...user, permissions } },
  }));
  const session = createAuthSession();
  await session.load();
  const component = defineComponent({ render: () => h('div') });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/directorio/clientes', component },
      { path: '/inicio-sesion', name: 'login', component },
      { path: '/sin-permiso', name: 'forbidden', component },
    ],
  });
  await router.push('/directorio/clientes?search=Ana#listado');
  let access!: ReturnType<typeof usePageAccess>;
  mount(
    defineComponent({
      setup() {
        access = usePageAccess();
        return () => h('div');
      },
    }),
    {
      global: { plugins: [router], provide: { [authSessionKey as symbol]: session } },
    },
  );
  return {
    access,
    router,
    session,
    revoke: () => {
      permissions = [];
    },
  };
};

it('401 conserva el destino completo para recuperar la navegación tras iniciar sesión', async () => {
  const { access, router } = await openPage();
  access.onError(new ApiError('Sesión vencida', 401));
  await flushPromises();
  expect(router.currentRoute.value.name).toBe('login');
  expect(router.currentRoute.value.query.returnTo).toBe('/directorio/clientes?search=Ana#listado');
});

it('403 abre acceso denegado, sin enviar al login', async () => {
  const { access, router } = await openPage();
  access.onDenied(403);
  await flushPromises();
  expect(router.currentRoute.value.name).toBe('forbidden');
});

it('un fallo de red o validación conserva la pantalla y sus permisos se leen de la sesión vigente', async () => {
  const { access, router, session, revoke } = await openPage();
  for (const cause of [
    new Error('Red'),
    new ApiError('Datos inválidos', 400),
    new ApiError('Fallo', 500),
  ])
    access.onError(cause);
  await flushPromises();
  expect(router.currentRoute.value.fullPath).toBe('/directorio/clientes?search=Ana#listado');
  expect(access.has('clients:read')).toBe(true);
  revoke();
  await session.load();
  expect(access.has('clients:read')).toBe(false);
});
