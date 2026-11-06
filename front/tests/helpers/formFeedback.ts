import { expect, type Page } from '@playwright/test';

export const acknowledgeFormError = async (page: Page, message: string | RegExp) => {
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText(message);
  await dialog.getByRole('button', { name: 'Volver al formulario', exact: true }).click();
  await expect(dialog).toBeHidden();
};
