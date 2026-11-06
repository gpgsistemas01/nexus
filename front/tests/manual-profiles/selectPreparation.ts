import { expect, type Page, type Locator, type BrowserContext } from '@playwright/test';
import { findWasteReference, MANUAL_LOOKUP_PAGE_SIZE } from '../../scripts/manual/preparation.mjs';
import { inventoryParams } from '../../src/modules/warehouse/services/inventoryPageRequest.js';

type WasteReference = Awaited<ReturnType<typeof findWasteReference>>;
const wasteReferences = new WeakMap<BrowserContext, WasteReference>();

export const readManualJson = async (page: Page, url: string) => {
  const response = await page.evaluate(async (url) => {
    const result = await fetch(url, {
      credentials: 'same-origin',
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: 'application/json' },
    });
    return { ok: result.ok, status: result.status, body: await result.json().catch(() => null) };
  }, url);
  if (!response.ok) throw new Error(`No se pudo preparar la captura (HTTP ${response.status}).`);
  return response.body;
};

const selectNamedOption = async (page: Page, dialog: Locator, label: string, value: string) => {
  const field = dialog.getByRole('combobox', { name: label, exact: true });
  await expect(field).toBeEnabled();
  await field.fill(value);
  await page.getByRole('option', { name: value, exact: true }).click();
};

export const selectWasteReference = async (page: Page, dialog: Locator) => {
  let reference = wasteReferences.get(page.context());
  if (!reference) {
    reference = await findWasteReference(
      async ({
        resource,
        supplierId,
        start,
      }: {
        resource: string;
        supplierId: string;
        start: number;
      }) => {
        const params = inventoryParams({
          supplierId,
          page: 1,
          length: MANUAL_LOOKUP_PAGE_SIZE,
        });
        params.set('start', String(start));
        if (resource === 'suppliers') params.set('onlyActive', 'true');

        return readManualJson(page, `/api/warehouse/${resource}?${params}`);
      },
    );
    wasteReferences.set(page.context(), reference);
  }

  await selectNamedOption(page, dialog, 'Proveedor', reference.supplier.tradeName);
  const field = dialog.getByRole('combobox', {
    name: 'Material de referencia del proveedor',
    exact: true,
  });
  await expect(field).toBeEnabled();
  await field.fill(reference.material.name);
  await page
    .getByRole('option', {
      name: `${reference.material.name} · ${reference.material.presentation.name} · ${reference.material.base} × ${reference.material.height}`,
      exact: true,
    })
    .click();
};
