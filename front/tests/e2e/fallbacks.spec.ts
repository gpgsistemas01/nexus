import { test, expect } from '@playwright/test';

const states = [
  ['/pagina-inexistente', 'Página no encontrada'],
  ['/sin-permiso', 'Acceso no permitido'],
  ['/sesion-no-disponible', 'No se pudo comprobar la sesión'],
] as const;

for (const width of [320, 1440]) {
  for (const [path, title] of states) {
    test(`recuperación: ${title} a ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const actions = page.getByRole('main').locator('button, a');
      for (const action of await actions.all()) {
        await expect(action).toBeInViewport();
        expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      await page.keyboard.press('Tab');
      await expect(actions.first()).toBeFocused();
      await page.screenshot({
        path: test.info().outputPath('fallback.png'),
        animations: 'disabled',
      });
      if (path === '/pagina-inexistente') {
        await page.getByRole('link', { name: 'Volver al inicio', exact: true }).click();
        await expect(
          page.getByRole('heading', { name: 'Iniciar sesión', exact: true }),
        ).toBeVisible();
      }
    });
  }
}

test('recuperación: un fallo de Vuetify permite recargar desde el fallback de arranque', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.route('**/src/app/plugins/vuetify.ts*', (route) => route.abort(), { times: 1 });
  await page.goto('/inicio-sesion');
  await expect(
    page.getByRole('heading', { name: 'No se pudo cargar la aplicación', exact: true }),
  ).toBeVisible();
  const retry = page.getByRole('button', { name: 'Volver a intentar', exact: true });
  await expect(retry).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.screenshot({
    path: test.info().outputPath('startup-fallback.png'),
    animations: 'disabled',
  });
  await retry.click();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
});
