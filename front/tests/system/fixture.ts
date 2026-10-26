import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

export interface SystemFixture {
  userId: string;
  userName: string;
  excludedUser: string;
  password: string;
  clientName: string;
  excludedClient: string;
  supplierName: string;
  excludedSupplier: string;
}
export const systemFixturePath = new URL(
  '../../build/test-results/system-fixture.json',
  import.meta.url,
);
export const readSystemFixture = (): SystemFixture =>
  JSON.parse(readFileSync(systemFixturePath, 'utf8'));
export const loginInBrowser = async (page: Page) => {
  const fixture = readSystemFixture();
  await page.goto('/inicio-sesion');
  await page
    .getByRole('textbox', { name: 'Nombre de usuario', exact: true })
    .fill(fixture.userName);
  await page.getByLabel('Contraseña', { exact: true }).fill(fixture.password);
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
};
