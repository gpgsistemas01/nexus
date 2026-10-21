import { expect, test } from '@playwright/test';

test('login: captura inválida, rechazo genérico y reintento con cookies hacia materiales', async ({ page, context }) => {
  const requests: { url: string; data: unknown }[] = [];
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  let attempt = 0;
  await page.route('**/api/auth/**', async route => {
    requests.push({ url: new URL(route.request().url()).pathname, data: route.request().postDataJSON() });
    attempt += 1;
    await route.fulfill({ status: attempt === 1 ? 401 : 200, contentType: 'application/json',
      headers: attempt === 1 ? {} : { 'Set-Cookie': 'accessToken=prueba; HttpOnly; Path=/; SameSite=Lax' },
      body: JSON.stringify({ code: attempt === 1 ? 'LOGIN_ERROR' : 'SUCCESS_LOGIN' }),
    });
  });
  await page.route('**/almacen/materiales', route => route.fulfill({
    contentType: 'text/html', body: '<h1>Materiales EJS</h1>',
  }));
  await page.goto('/');
  await page.getByRole('heading', { name: 'Iniciar sesión' }).waitFor();
  await expect(page).toHaveURL(/\/inicio-sesion$/);
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.getByText('El nombre de usuario es un valor requerido')).toBeHidden();
  await expect(page.getByText('La contraseña es un valor requerido')).toBeHidden();
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByText('El nombre de usuario es un valor requerido')).toBeVisible();
  await expect(page.getByText('La contraseña es un valor requerido')).toBeVisible();
  expect(requests).toEqual([]);

  const username = page.getByRole('textbox', { name: 'Nombre de usuario', exact: true });
  const password = page.locator('input[name="password"]');
  await username.fill(' usuario ');
  await password.fill(' legado ');
  await page.getByRole('button', { name: 'Mostrar contraseña', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar contraseña', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('checkbox', { name: 'Recordar usuario' }).check();
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert', { name: 'Error de acceso' })).toHaveText('Usuario o contraseña incorrectos.');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await password.fill(' válida ');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page).toHaveURL(/\/almacen\/materiales$/);
  await expect(page.getByRole('heading', { name: 'Materiales EJS' })).toBeVisible();
  expect(requests).toEqual([
    { url: '/api/auth/login', data: { name: 'usuario', password: ' legado ' } },
    { url: '/api/auth/login', data: { name: 'usuario', password: ' válida ' } },
  ]);
  expect((await context.cookies()).find(cookie => cookie.name === 'accessToken')?.httpOnly).toBe(true);
  await page.goto('/inicio-sesion');
  await expect(username).toHaveValue('usuario');
  await expect(password).toHaveValue('');
  await expect(page.getByRole('checkbox', { name: 'Recordar usuario' })).toBeChecked();
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual({ 'nexus.rememberedUser': 'usuario' });
  expect(errors).toEqual([]);
});

test('login: errores 400 por campo y fallos de conexión permiten reintentar', async ({ page }) => {
  let attempt = 0;
  await page.route('**/api/auth/login', async route => {
    attempt += 1;
    if (attempt === 2) return route.abort('failed');
    await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({
      code: 'VALIDATION_ERROR', errors: { name: { code: 'USERNAME_TOO_LONG' } },
    }) });
  });
  await page.goto('/inicio-sesion');
  await page.locator('input[name="name"]').fill('usuario');
  await page.locator('input[name="password"]').fill('abc');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert', { name: 'Error de acceso' })).toHaveText('Revisa los datos de acceso.');
  await expect(page.locator('input[name="name"]')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('input[name="name"]').fill('otro.usuario');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('alert', { name: 'Error de acceso' })).toContainText('No fue posible conectar');
  await expect(page.getByRole('button', { name: 'Ingresar', exact: true })).toBeEnabled();
});

test('login: envío pendiente bloquea duplicados y recupera controles tras un fallo', async ({ page }) => {
  let requests = 0;
  let finish!: () => void;
  const pending = new Promise<void>(resolve => { finish = resolve; });
  await page.route('**/api/auth/login', async route => {
    requests += 1;
    await pending;
    await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/inicio-sesion');
  await page.locator('input[name="name"]').fill('usuario');
  await page.locator('input[name="password"]').fill('abc');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
  await page.locator('form').dispatchEvent('submit');
  expect(requests).toBe(1);
  finish();
  await expect(page.getByRole('alert', { name: 'Error de acceso' })).toContainText('No se pudo iniciar sesión');
  await expect(page.getByRole('button', { name: 'Ingresar', exact: true })).toBeEnabled();
});

test('login: acceso directo, recarga y móvil sin desbordamiento', async ({ page }) => {
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/inicio-sesion');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Ingresar', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/ruta-inexistente');
  await page.getByRole('link', { name: 'Volver al inicio' }).click();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ingresar', exact: true })).toBeVisible();
});

test('un fallo al cargar la página muestra recuperación y permite reintentar', async ({ page }) => {
  const unhandledErrors: string[] = [];
  page.on('pageerror', error => unhandledErrors.push(error.message));
  const loginModule = '**/src/modules/auth/pages/LoginPage.vue';
  await page.route(loginModule, route => route.abort('failed'));

  await page.goto('/inicio-sesion');
  await expect(page.getByRole('heading', { name: 'No se pudo cargar la aplicación' })).toBeVisible();

  await page.unroute(loginModule);
  await page.getByRole('button', { name: 'Volver a intentar' }).click();

  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  expect(unhandledErrors).toEqual([]);
});
