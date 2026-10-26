import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';
import { loginInBrowser, readSystemFixture } from './fixture.js';

const backendRequire = createRequire(new URL('../../../back/package.json', import.meta.url));

test('sistema: login, alta persistida, reportes reales, renovación y cierre con rutas protegidas', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const fixture = readSystemFixture();
  const { prisma } = await import(new URL('../../../back/src/lib/prisma.js', import.meta.url).href);
  try {
    await loginInBrowser(page);
    await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toBeVisible();
    await page.goto('/directorio/clientes');
    await page.getByRole('button', { name: 'Nuevo cliente', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Registrar cliente', exact: true });
    await dialog.getByRole('textbox', { name: 'Nombre', exact: true }).fill(fixture.clientName);
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(dialog).toBeHidden();
    const saved = await prisma.client.findMany({ where: { name: fixture.clientName } });
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ isActive: true });
    await page.reload();
    await expect(page.getByRole('cell', { name: fixture.clientName, exact: true })).toBeVisible();

    for (const [path, value, excluded] of [
      ['/identidad/usuarios', fixture.userName, fixture.excludedUser],
      ['/directorio/clientes', fixture.clientName, fixture.excludedClient],
      ['/directorio/proveedores', fixture.supplierName, fixture.excludedSupplier],
    ]) {
      await page.goto(path!);
      await page.getByRole('textbox', { name: 'Buscar por nombre', exact: true }).fill(value!);
      const response = page.waitForResponse(
        (item) =>
          item.request().method() === 'GET' &&
          item.url().includes(`search=${encodeURIComponent(value!).replace(/%20/g, '+')}`),
      );
      await page.getByRole('button', { name: 'Buscar', exact: true }).click();
      await response;
      const downloaded = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Exportar Excel', exact: true }).click();
      const stream = await (await downloaded).createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(Buffer.from(chunk));
      const workbook = new (backendRequire('exceljs').Workbook)();
      await workbook.xlsx.load(Buffer.concat(chunks));
      const sheet = workbook.worksheets[0];
      expect(sheet.rowCount).toBeGreaterThan(1);
      const text = JSON.stringify(sheet.getSheetValues());
      expect(text).toContain(value);
      expect(text).not.toContain(excluded);
    }

    await page.context().clearCookies({ name: 'accessToken' });
    const refreshed = page.waitForResponse(
      (item) => item.url().endsWith('/api/auth/refresh') && item.request().method() === 'POST',
    );
    await page.reload();
    expect((await refreshed).status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: 'Tabla de Proveedores', exact: true }),
    ).toBeVisible();
    expect(
      (await page.context().cookies())
        .filter((cookie) => ['accessToken', 'refreshToken'].includes(cookie.name))
        .every((cookie) => cookie.httpOnly),
    ).toBe(true);
    await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
    expect(
      (await page.context().cookies()).filter((cookie) =>
        ['accessToken', 'refreshToken'].includes(cookie.name),
      ),
    ).toEqual([]);
    expect((await page.request.get('/api/auth/me')).status()).toBe(401);
    expect((await page.request.post('/api/auth/refresh')).status()).toBe(401);
    await page.goto('/directorio/clientes');
    await expect(page).toHaveURL(/inicio-sesion\?returnTo=/);
    expect(await prisma.client.count({ where: { name: fixture.clientName } })).toBe(1);
  } finally {
    await prisma.$disconnect();
  }
});
