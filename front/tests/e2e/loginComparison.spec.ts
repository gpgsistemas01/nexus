import { expect, test } from '@playwright/test';

const libraries = [
  { id: 'mdb', name: 'MDB Vue' },
  { id: 'vuetify', name: 'Vuetify' },
  { id: 'primevue', name: 'PrimeVue' },
];

for (const library of libraries) {
  test(`${library.name}: selección, errores, captura y recarga`, async ({ page }) => {
    const failures: string[] = [];
    const apiRequests: string[] = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('request', request => {
      if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url());
    });
    await page.goto('/inicio');
    const selector = page.getByRole('button', { name: new RegExp(library.name) });
    await selector.click();
    await expect(selector).toHaveAttribute('aria-pressed', 'true');
    const preview = page.frameLocator(`iframe[title="Login con ${library.name}"]`);
    await expect(preview.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    await preview.getByRole('button', { name: 'Ingresar', exact: true }).click();
    await expect(preview.getByText('Escribe tu nombre de usuario.')).toBeVisible();
    await expect(preview.getByText('Escribe tu contraseña.')).toBeVisible();
    await preview.locator('input[name="name"]').fill('usuario.demo');
    await preview.locator('input[name="password"]').fill('clave-de-prueba');
    await preview.getByRole('button', { name: 'Mostrar contraseña' }).click();
    await expect(preview.locator('input[name="password"]')).toHaveAttribute('type', 'text');
    await preview.getByRole('button', { name: 'Ocultar contraseña' }).click();
    await expect(preview.locator('input[name="password"]')).toHaveAttribute('type', 'password');
    await preview.getByRole('button', { name: 'Ingresar', exact: true }).click();
    await expect(preview.getByRole('status')).toHaveText('Datos completos. Esta demostración no inicia sesión.');
    await page.reload();
    await expect(page.getByRole('button', { name: new RegExp(library.name) })).toHaveAttribute('aria-pressed', 'true');
    await expect(preview.locator('input[name="password"]')).toHaveValue('');
    expect(apiRequests).toEqual([]);
    expect(failures).toEqual([]);
  });
}

test('las tres opciones están disponibles en móvil sin desbordamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/inicio');
  for (const library of libraries) {
    await page.getByRole('button', { name: new RegExp(library.name) }).click();
    const preview = page.frameLocator(`iframe[title="Login con ${library.name}"]`);
    await expect(preview.getByRole('button', { name: 'Ingresar', exact: true })).toBeVisible();
    const frame = page.frames().find(frame => frame.url().endsWith(`/comparar/login/${library.id}`));
    expect(frame).toBeDefined();
    expect(await frame!.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
