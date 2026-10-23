import { afterEach, expect, it } from 'vitest';
import {
  buildInventoryPayload,
  initialInventoryValues,
  previewWaste,
} from '../../../../src/modules/warehouse/formModel.js';
import { inventoryService } from '../../../../src/modules/warehouse/services/inventoryService.js';
import { directoryService } from '../../../../src/modules/directory/services/directoryService.js';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';
import { ids } from '../../../fixtures/inventory.js';
import { purchaseItem } from '../../../fixtures/purchases.js';
import { supplierData } from '../../../fixtures/records.js';

const original = apiClient.http.defaults.adapter;
afterEach(() => {
  apiClient.http.defaults.adapter = original;
});

it.each(['materials', 'consumables'] as const)(
  'el alta rápida de %s no introduce saldo ni costo; devuelve la identidad seleccionable',
  async (resource) => {
    const values = {
      ...initialInventoryValues({ action: 'create' }),
      name: ' Lona ',
      supplierId: ids.supplier,
      presentationId: ids.presentation,
      unitMeasureId: ids.unit,
      newStock: '999',
      maxUnitCost: '999',
      observations: 'no enviar',
    };
    const payload = buildInventoryPayload(
      resource,
      { action: 'create' },
      values,
      previewWaste(values),
      'goodsReceipt',
    );
    expect(payload).toMatchObject({
      creationContext: 'goodsReceipt',
      name: 'Lona',
      supplierId: ids.supplier,
    });
    for (const field of ['newStock', 'maxUnitCost', 'observations', 'currentStock'])
      expect(payload).not.toHaveProperty(field);
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      expect(config.method).toBe('post');
      expect(config.url).toBe(`/api/warehouse/${resource}`);
      return { data: { code: 'CREATED_MATERIAL', material: purchaseItem } };
    });
    const item = await inventoryService.createForPurchase(
      resource,
      payload,
      new AbortController().signal,
    );
    expect(item.id).toBe(ids.material);
    expect(item.id).not.toBe(ids.offer);
    expect(item.data).toEqual(purchaseItem);
  },
);
it('el proveedor recién creado devuelve su identidad, versión y estado para volver a Compras', async () => {
  apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
    data: { code: 'CREATED_SUPPLIER', supplier: supplierData },
  }));
  expect(
    await directoryService.save(
      'suppliers',
      { action: 'create' },
      {},
      new AbortController().signal,
    ),
  ).toMatchObject({ id: ids.supplier, version: 6, tradeName: 'Proveedor Central', isActive: true });
});
