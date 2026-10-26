import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockRecords } from './recordsFixtures.js';
import { user } from '../fixtures/inventory.js';
import { recordPermissions } from '../fixtures/records.js';

// Sólo las respuestas HTTP son simuladas: Chromium administra las cookies HttpOnly.
const sessionScenario = async (page: Page) => {
  await mockRecords(page);
  const state = {
    isAvailable: true,
    isAuthenticated: true,
    refreshStatus: 200,
    refreshCalls: 0,
    meCalls: 0,
    permissions: [...recordPermissions],
  };
  await page.context().addCookies(
    ['accessToken', 'refreshToken'].map((name) => ({
      name,
      value: name === 'accessToken' ? 'expired-fixture' : 'refresh-fixture',
      url: 'http://127.0.0.1:5173',
      httpOnly: true,
      sameSite: 'Lax' as const,
    })),
  );
  await page.route('**/api/auth/me', (route) => {
    state.meCalls++;
    if (!state.isAvailable)
      return route.fulfill({ status: 502, contentType: 'text/plain', body: 'Bad Gateway' });
    if (
      !state.isAuthenticated ||
      !(route.request().headers().cookie ?? '').includes('accessToken=renewed-fixture')
    )
      return route.fulfill({
        status: 401,
        headers: { 'set-cookie': 'accessToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax' },
        json: { code: 'INVALID_AUTH' },
      });
    return route.fulfill({ json: { user: { ...user, permissions: state.permissions } } });
  });
  await page.route('**/api/auth/refresh', (route) => {
    state.refreshCalls++;
    expect(route.request().method()).toBe('POST');
    if (!state.isAuthenticated)
      return route.fulfill({ status: 401, json: { code: 'INVALID_AUTH' } });
    expect(route.request().headers().cookie).toContain('refreshToken=refresh-fixture');
    if (state.refreshStatus !== 200)
      return route.fulfill({
        status: state.refreshStatus,
        json: { code: state.refreshStatus === 401 ? 'INVALID_AUTH' : 'SERVER_ERROR' },
      });
    return route.fulfill({
      contentType: 'text/plain',
      body: 'OK',
      headers: { 'set-cookie': 'accessToken=renewed-fixture; Path=/; HttpOnly; SameSite=Lax' },
    });
  });
  return state;
};

const target = '/directorio/clientes?consulta=Ana#tabla';

test('sesión: cerrar elimina cookies y el acceso directo posterior vuelve al login', async ({
  page,
}) => {
  const state = await sessionScenario(page);
  let logoutCalls = 0;
  await page.route('**/cerrar-sesion', (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().cookie).toContain('refreshToken=refresh-fixture');
    logoutCalls++;
    state.isAuthenticated = false;
    return route.fulfill({
      status: 303,
      headers: {
        location: '/inicio-sesion',
        'set-cookie': ['accessToken', 'refreshToken']
          .map((name) => `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`)
          .join('\n'),
      },
    });
  });
  await page.goto(target);
  await expect(page.getByRole('heading', { name: 'Tabla de Clientes', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  expect(logoutCalls).toBe(1);
  expect(
    (await page.context().cookies()).filter((cookie) =>
      ['accessToken', 'refreshToken'].includes(cookie.name),
    ),
  ).toEqual([]);
  await page.goto(target);
  await expect(page).toHaveURL(/inicio-sesion\?returnTo=/);
  await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  expect(state.refreshCalls).toBe(2);
});

test('sesión: un access token vencido se renueva automáticamente mediante la cookie HttpOnly', async ({
  page,
}) => {
  const state = await sessionScenario(page);
  await page.goto(target);
  await expect(page.getByRole('heading', { name: 'Tabla de Clientes', exact: true })).toBeVisible();
  expect(state.refreshCalls).toBe(1);
  expect(state.meCalls).toBe(2);
  await expect(page).toHaveURL(new RegExp('/directorio/clientes\\?consulta=Ana#tabla$'));
  const cookies = await page.context().cookies();
  expect(cookies.find((cookie) => cookie.name === 'accessToken')).toMatchObject({
    value: 'renewed-fixture',
    httpOnly: true,
  });
});

test('sesión: el reintento informa la espera y recupera la ruta original tras una caída del backend', async ({
  page,
}) => {
  const state = await sessionScenario(page);
  state.isAvailable = false;
  await page.goto(target);
  await expect(page.getByRole('heading', { name: 'No se pudo comprobar la sesión' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(target);
  await page.reload();
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    '**/api/auth/me',
    async (route) => {
      await pending;
      await route.fallback();
    },
    { times: 1 },
  );
  await page.getByRole('button', { name: 'Volver a comprobar el acceso', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Comprobando acceso…', exact: true }),
  ).toBeDisabled();
  release();
  await expect(page.getByRole('alert')).toContainText('El servidor sigue sin estar disponible');
  expect(state.refreshCalls).toBe(0);
  state.isAvailable = true;
  await page.getByRole('button', { name: 'Volver a comprobar el acceso', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tabla de Clientes', exact: true })).toBeVisible();
  expect(new URL(page.url()).pathname + new URL(page.url()).search + new URL(page.url()).hash).toBe(
    target,
  );
  expect(state.refreshCalls).toBe(1);
});

test('sesión: un 502 del refresh se puede recuperar sin volver a capturar credenciales', async ({
  page,
}) => {
  const state = await sessionScenario(page);
  state.refreshStatus = 502;
  await page.goto(target);
  await expect(page.getByRole('heading', { name: 'No se pudo comprobar la sesión' })).toBeVisible();
  expect(state.refreshCalls).toBe(1);
  state.refreshStatus = 200;
  await page.getByRole('button', { name: 'Volver a comprobar el acceso', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tabla de Clientes', exact: true })).toBeVisible();
  expect(state.refreshCalls).toBe(2);
});

test('sesión: un refresh rechazado abre el login y conserva el destino, sin bucle', async ({
  page,
}) => {
  const state = await sessionScenario(page);
  state.refreshStatus = 401;
  await page.goto(target);
  await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(target);
  expect(state.refreshCalls).toBe(1);
});

test('sesión: revalidar permisos conserva el módulo solicitado', async ({ page }) => {
  const state = await sessionScenario(page);
  state.permissions = ['clients:page-view', 'clients:read'];
  await page.goto('/identidad/usuarios');
  await expect(
    page.getByRole('heading', { name: 'Acceso no permitido', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Volver a comprobar el acceso', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Tu cuenta todavía no tiene permiso');
  state.permissions = [...recordPermissions];
  await page.getByRole('button', { name: 'Volver a comprobar el acceso', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tabla de Usuarios', exact: true })).toBeVisible();
  expect(state.refreshCalls).toBe(1);
});
