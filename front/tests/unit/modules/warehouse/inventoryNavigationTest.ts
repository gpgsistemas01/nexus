import { createMemoryHistory } from 'vue-router';
import { describe, expect, it, vi } from 'vitest';
import { createAppRouter } from '../../../../src/app/router/index.js';
import { createAuthSession } from '../../../../src/modules/auth/session.js';
import { ApiError } from '../../../../src/shared/http/apiError.js';
import type { AuthSession } from '../../../../src/modules/auth/session.js';
import { user } from '../../../fixtures/inventory.js';

// Estas pruebas comprueban las guardas; Chromium ejecuta los componentes Vuetify reales.
vi.mock('../../../../src/app/layouts/AppLayout.vue', () => ({
  default: { template: '<div />' },
}));
vi.mock('../../../../src/modules/warehouse/pages/InventoryPage.vue', () => ({
  default: { template: '<div />' },
}));
vi.mock('../../../../src/modules/catalogs/pages/CatalogPage.vue', () => ({
  default: { template: '<div />' },
}));
vi.mock('../../../../src/modules/auth/pages/LoginPage.vue', () => ({
  default: { template: '<div />' },
}));

const navigate = async (path: string, sessionUser = user, error?: Error) => {
  const session = {
    load: error ? vi.fn().mockRejectedValue(error) : vi.fn().mockResolvedValue(sessionUser),
  } as unknown as AuthSession;
  const router = createAppRouter(createMemoryHistory(), session);
  await router.push(path);
  return router.currentRoute.value;
};
describe('sesión y permisos de almacén (DP-VUE-WH-001)', () => {
  it.each(['/almacen/materiales', '/almacen/consumibles', '/almacen/mermas'])(
    'permite abrir directamente %s con el permiso correspondiente',
    async (path) => {
      expect((await navigate(path)).path).toBe(path);
    },
  );
  it('deniega una URL de merma a una cuenta que sólo puede consultar materiales', async () => {
    expect(
      (await navigate('/almacen/mermas', { ...user, permissions: ['materials:read'] })).name,
    ).toBe('forbidden');
  });
  it('ofrece mermas como entrada si es el único módulo permitido', async () => {
    expect((await navigate('/almacen', { ...user, permissions: ['wastes:page-view'] })).name).toBe(
      'wastes',
    );
  });
  it('una sesión rechazada vuelve al login y conserva una ruta interna de retorno', async () => {
    const route = await navigate('/almacen/consumibles', user, new ApiError('Sesión vencida', 401));
    expect(route.name).toBe('login');
    expect(route.query.returnTo).toBe('/almacen/consumibles');
  });
  it('un fallo del servidor permite reintentar la sesión sin presentarlo como credenciales inválidas', async () => {
    expect(
      (await navigate('/almacen/materiales', user, new ApiError('No disponible', 503))).name,
    ).toBe('session-unavailable');
  });
  it('rechaza una respuesta de sesión incompleta en lugar de asumir permisos', async () => {
    const request = vi.fn().mockResolvedValue({ user: { id: user.id, name: user.name } });
    await expect(createAuthSession(request).load()).rejects.toThrow('comprobar la sesión');
  });
});

describe('rutas y permisos de catálogos (DP-VUE-CAT-001)', () => {
  it.each([
    'departments',
    'roles',
    'presentations',
    'unit-measures',
    'reasons',
    'fulfillment-statuses',
  ])('permite %s a catalogs:manage', async (catalog) => {
    expect(
      (await navigate(`/catalogos/${catalog}`, { ...user, permissions: ['catalogs:manage'] })).name,
    ).toBe(`catalog-${catalog}`);
  });
  it('una cuenta sólo de catálogos llega a Áreas después del login', async () => {
    expect((await navigate('/almacen', { ...user, permissions: ['catalogs:manage'] })).name).toBe(
      'catalog-departments',
    );
  });
  it('rechaza acceso directo sin permiso y no reconoce catálogos fuera de la lista blanca', async () => {
    expect(
      (await navigate('/catalogos/roles', { ...user, permissions: ['materials:read'] })).name,
    ).toBe('forbidden');
    expect((await navigate('/catalogos/otro')).name).toBe('not-found');
  });
});
