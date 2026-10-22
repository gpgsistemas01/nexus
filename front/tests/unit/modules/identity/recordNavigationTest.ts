import { createMemoryHistory } from 'vue-router';
import { expect, it, vi } from 'vitest';
import { createAppRouter } from '../../../../src/app/router/index.js';
import { APP_NAVIGATION_GROUPS } from '../../../../src/app/navigation.js';
import type { AuthSession } from '../../../../src/modules/auth/session.js';
import { user } from '../../../fixtures/inventory.js';
vi.mock('../../../../src/app/layouts/AppLayout.vue', () => ({ default: { template: '<div />' } }));
vi.mock('../../../../src/modules/identity/pages/IdentityPage.vue', () => ({
  default: { template: '<div />' },
}));
vi.mock('../../../../src/modules/directory/pages/DirectoryPage.vue', () => ({
  default: { template: '<div />' },
}));
const navigate = async (path: string, permissions: string[]) => {
  const session = {
    load: vi.fn().mockResolvedValue({ ...user, permissions }),
  } as unknown as AuthSession;
  const router = createAppRouter(createMemoryHistory(), session);
  await router.push(path);
  return router.currentRoute.value;
};
const routes = [
  ['/identidad/personas', 'persons:page-view', 'persons', 'identity'],
  ['/identidad/usuarios', 'users:manage', 'users', 'identity'],
  ['/directorio/clientes', 'clients:page-view', 'clients', 'directory'],
  ['/directorio/proveedores', 'suppliers:page-view', 'suppliers', 'directory'],
] as const;
it.each(routes)(
  '%s requiere su permiso y pertenece a su grupo Vue',
  async (path, permission, name, group) => {
    expect((await navigate(path, [permission])).name).toBe(name);
    expect((await navigate(path, [])).name).toBe('forbidden');
    const link = APP_NAVIGATION_GROUPS.find((item) => item.id === group)?.links.find(
      (item) => item.to === path,
    );
    expect(link?.permission).toBe(permission);
  },
);
it.each(routes)(
  'una cuenta exclusiva de %s llega a su módulo después del login',
  async (_, permission, name) => {
    expect((await navigate('/almacen', [permission])).name).toBe(name);
  },
);
it('las entradas de sección eligen su primer destino autorizado, sin exigir catálogos', async () => {
  expect((await navigate('/identidad', ['users:manage'])).name).toBe('users');
  expect((await navigate('/directorio', ['suppliers:page-view'])).name).toBe('suppliers');
  expect((await navigate('/directorio', ['users:manage'])).name).toBe('forbidden');
});
