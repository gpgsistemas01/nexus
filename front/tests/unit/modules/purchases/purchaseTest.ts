import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmAction } from '../../../../src/shared/ui/feedback.js';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';
import { ids, pageOf, material } from '../../../fixtures/inventory.js';
import { purchase, purchaseItem } from '../../../fixtures/purchases.js';
import {
  normalizePurchaseDocument,
  mapPurchaseItemOption,
} from '../../../../src/modules/purchases/mappers/purchaseResponseMapper.js';
import { createPurchaseDetailDraft } from '../../../../src/modules/purchases/purchaseDetails.js';
import {
  createInitialPurchaseValues,
  emptyPurchaseFilters,
} from '../../../../src/modules/purchases/purchaseForm.js';
import { mapPurchaseFormToRequest } from '../../../../src/modules/purchases/mappers/purchaseRequestMapper.js';
import {
  calculatePurchaseTotals,
  calculatePurchaseCorrectionTotals,
} from '../../../../src/modules/purchases/purchaseCalculations.js';
import { purchaseService } from '../../../../src/modules/purchases/services/purchaseService.js';
import { purchaseLookupService } from '../../../../src/modules/purchases/services/purchaseLookupService.js';
import { usePurchaseEditor } from '../../../../src/modules/purchases/composables/usePurchaseEditor.js';
import { usePurchaseLineEntry } from '../../../../src/modules/purchases/composables/usePurchaseLineEntry.js';
import { useDocumentRead } from '../../../../src/shared/composables/useDocumentRead.js';
import { usePurchaseCorrection } from '../../../../src/modules/purchases/composables/usePurchaseCorrection.js';
import type { PurchaseTarget } from '../../../../src/modules/purchases/purchase.js';

vi.mock('../../../../src/shared/ui/feedback.js', () => ({
  confirmAction: vi.fn().mockResolvedValue(true),
}));
const confirmation = {
  code: 'UPDATED_GOODS_RECEIPT',
  message: '¡Compra actualizada exitosamente!',
};
const original = apiClient.http.defaults.adapter;
afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(confirmAction).mockReset().mockResolvedValue(true);
  apiClient.http.defaults.adapter = original;
});

it('corregir conserva los otros detalles y excluye cancelados de la vista previa', () => {
  const receipt = document();
  const detail = receipt.details[0]!;
  receipt.details.push({
    ...detail,
    id: 'otro',
    quantity: 1,
    netPurchaseAmount: 20,
    grossPurchaseAmount: 23.2,
  });
  receipt.details.push({ ...detail, id: 'cancelado', status: 'CANCELED' });
  expect(
    calculatePurchaseCorrectionTotals(receipt, detail, { quantity: '1', costPerUnitType: '50' }),
  ).toEqual({ quantity: 2, net: 70, gross: 81.2 });
  expect(detail.quantity).toBe('2');
  expect(
    calculatePurchaseCorrectionTotals(receipt, detail, { quantity: '', costPerUnitType: '50' }),
  ).toBeNull();
});

it('una corrección sin cambios no pide confirmación ni escribe; cancelar conserva la captura', async () => {
  const request = vi.spyOn(purchaseService, 'changeDetail').mockResolvedValue(confirmation);
  const saved = vi.fn();
  const { state } = harness(() =>
    usePurchaseCorrection({
      resource: 'materials',
      document: document(),
      detail: document().details[0]!,
      onSaved: saved,
      onDenied: vi.fn(),
    }),
  );
  await state.submit();
  expect(confirmAction).not.toHaveBeenCalled();
  expect(state.message.value).toContain('Debe modificar');
  state.update('quantity', '1');
  vi.mocked(confirmAction).mockResolvedValueOnce(false);
  await state.submit();
  expect(request).not.toHaveBeenCalled();
  expect(state.values.quantity).toBe('1');
  expect(saved).not.toHaveBeenCalled();
  await state.submit();
  expect(request).toHaveBeenCalledOnce();
  expect(saved).toHaveBeenCalledWith(confirmation);
});
const document = () => normalizePurchaseDocument(purchase, 'materials');
const signal = () => new AbortController().signal;
const query = {
  ...emptyPurchaseFilters(),
  page: 2,
  length: 10,
  search: 'COM',
  orderColumn: 0,
  direction: 'desc' as const,
};
const harness = <T>(setup: () => T) => {
  let state!: T;
  const wrapper = mount(
    defineComponent({
      setup() {
        state = setup();
        return () => h('div');
      },
    }),
  );
  return { state, wrapper };
};
const editor = (target: PurchaseTarget = { action: 'create' }) => {
  const saved = vi.fn();
  const request = vi.spyOn(purchaseService, 'save').mockResolvedValue(confirmation);
  const { state, wrapper } = harness(() =>
    usePurchaseEditor({
      resource: 'materials',
      target,
      has: () => false,
      onSaved: saved,
      onDenied: vi.fn(),
    }),
  );
  return { state, wrapper, request, saved };
};

describe('compras Vue: contratos y captura (DP-VUE-COM-001)', () => {
  it.each(['materials', 'consumables'] as const)(
    'lista %s con su contexto y filtros; no necesita versión',
    async (resource) => {
      apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
        const url = new URL(config.url!, 'http://test');
        expect(url.pathname).toBe(`/api/warehouse/goods-receipts/${resource}`);
        expect(url.searchParams.get('start')).toBe('10');
        expect(url.searchParams.get('search')).toBe('COM');
        return {
          data: pageOf([
            { ...purchase, type: resource === 'materials' ? 'MATERIAL' : 'CONSUMABLE' },
          ]),
        };
      });
      expect((await purchaseService.list(resource, query, signal())).data[0]?.referenceNumber).toBe(
        'COM-001',
      );
    },
  );
  it.each([
    { type: 'CONSUMABLE' },
    { observations: undefined },
    { details: [purchase.details[0], purchase.details[0]] },
    { totalQuantity: 'NaN' },
    { receptionDate: 'inválida' },
  ])('rechaza una consulta incoherente %j', (changes) => {
    expect(() => normalizePurchaseDocument({ ...purchase, ...changes }, 'materials')).toThrow();
  });
  it('la edición conserva proveedor y hora de México; omite partidas guardadas y valores derivados', () => {
    const values = createInitialPurchaseValues(document());
    expect(values.receptionDate).toBe('2026-10-22T12:30');
    values.supplierId = 'otro';
    const payload = mapPurchaseFormToRequest(values, document());
    expect(payload).toMatchObject({
      supplierId: ids.supplier,
      receptionDate: purchase.receptionDate,
      observations: purchase.observations,
    });
    expect(payload).not.toHaveProperty('details');
    expect(payload).not.toHaveProperty('expectedVersion');
    values.details = [
      createPurchaseDetailDraft(mapPurchaseItemOption(purchaseItem, 'materials'), 3, 100),
    ];
    values.details.push(document().details[0]!);
    expect(mapPurchaseFormToRequest(values, document()).details).toEqual([
      { materialId: ids.material, quantity: 3, costPerUnitType: 100 },
    ]);
    expect(
      calculatePurchaseTotals([
        ...document().details,
        { ...values.details[0]!, status: 'CANCELED' },
      ]),
    ).toEqual({ quantity: 2, net: 200, gross: 232 });
    values.isInvoiced = false;
    expect(mapPurchaseFormToRequest(values)).not.toHaveProperty('invoice');
  });
  it('abrir y perder foco sin captura no publica errores; enviar valida sin escribir', async () => {
    const { state, request } = editor();
    await flushPromises();
    await state.blur('supplierId');
    expect(state.errors.value).toEqual({});
    await state.submit();
    expect(state.errors.value.supplierId).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });
  it('editar no requiere nuevas partidas; un fallo conserva captura y sólo reenvía explícitamente', async () => {
    const { state, request, saved } = editor({ action: 'edit', document: document() });
    request.mockRejectedValueOnce(new Error('Sin conexión'));
    state.update('observations', ' Mi captura ');
    await state.submit();
    expect(request).toHaveBeenCalledTimes(1);
    expect(saved).not.toHaveBeenCalled();
    expect(state.values.observations).toBe(' Mi captura ');
    await state.submit();
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[1]![0].payload).not.toHaveProperty('details');
    expect(saved).toHaveBeenCalledOnce();
  });
  it('cambiar proveedor limpia las partidas nuevas y receptor; la consulta no escribe', async () => {
    const { state } = editor();
    state.update('supplierId', ids.supplier);
    state.update('receivedById', purchase.receivedById);
    state.addDetail(
      createPurchaseDetailDraft(mapPurchaseItemOption(purchaseItem, 'materials'), 2, 100),
    );
    state.update('supplierId', 'otro');
    expect(state.values.details).toEqual([]);
    expect(state.values.receivedById).toBe('');
    const view = editor({ action: 'view', document: document() });
    await view.state.submit();
    expect(view.request).not.toHaveBeenCalled();
  });
  it.each(['2026-02-30T12:00', '2026-13-01T12:00', ''])(
    'fecha de captura inválida %s no se normaliza a otra fecha aceptada',
    async (value) => {
      const { state, request } = editor({ action: 'edit', document: document() });
      state.update('receptionDate', value);
      await state.submit();
      expect(state.errors.value.receptionDate).toBeTruthy();
      expect(request).not.toHaveBeenCalled();
    },
  );
  it('corregir admite una cantidad positiva menor a uno y sólo envía cantidad/costo', async () => {
    const request = vi.spyOn(purchaseService, 'changeDetail').mockResolvedValue(confirmation);
    const { state } = harness(() =>
      usePurchaseCorrection({
        resource: 'materials',
        document: document(),
        detail: document().details[0]!,
        onSaved: vi.fn(),
        onDenied: vi.fn(),
      }),
    );
    state.update('quantity', '0');
    await state.submit();
    expect(request).not.toHaveBeenCalled();
    state.update('quantity', '0.5');
    await state.submit();
    expect(request).toHaveBeenCalledWith({
      resource: 'materials',
      documentId: purchase.id,
      detailId: purchase.details[0]!.id,
      change: { action: 'correct', quantity: 0.5, costPerUnitType: 100 },
      signal: expect.any(AbortSignal),
    });
  });
  it('agregar partida valida el mínimo uno y selecciona altas recientes aunque no estén en la página', async () => {
    vi.spyOn(purchaseLookupService, 'list').mockResolvedValue(pageOf([]));
    const added = vi.fn();
    const { state, wrapper } = harness(() =>
      usePurchaseLineEntry({
        resource: 'materials',
        supplier: { id: ids.supplier, title: 'Proveedor', data: {} },
        canRead: true,
        isDisabled: () => false,
        onAdded: added,
      }),
    );
    state.selectCreatedItem(mapPurchaseItemOption(purchaseItem, 'materials'));
    state.update('quantity', '0.5');
    state.update('costPerUnitType', '100');
    await state.add();
    expect(added).not.toHaveBeenCalled();
    state.update('quantity', '2');
    await state.add();
    expect(added).toHaveBeenCalledWith(
      expect.objectContaining({
        materialId: ids.material,
        convertedQuantity: 200,
        netPurchaseAmount: 200,
        grossPurchaseAmount: 232,
        isNew: true,
      }),
    );
    expect(state.values.materialId).toBe('');
    wrapper.unmount();
    await state.add();
    expect(added).toHaveBeenCalledTimes(1);
  });
  it('cerrar invalida consultas tardías y cancela transporte', async () => {
    let resolve!: (value: ReturnType<typeof document>) => void;
    const request = vi.spyOn(purchaseService, 'get').mockImplementation(
      () =>
        new Promise((finish) => {
          resolve = finish;
        }),
    );
    const { state, wrapper } = harness(() =>
      useDocumentRead({
        request: (id, signal) => purchaseService.get('materials', id, signal),
        onError: vi.fn(),
        errorMessage: 'No se pudo abrir la compra.',
      }),
    );
    const pending = state.load(purchase.id);
    wrapper.unmount();
    expect(request.mock.calls[0]![2].aborted).toBe(true);
    resolve(document());
    await pending;
    expect(state.document.value).toBeUndefined();
  });
  it.each(['filtered', 'current-month', 'specific-month'] as const)(
    'exportar %s no hereda límites ni borradores ajenos al alcance',
    async (mode) => {
      apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
        const url = new URL(config.url!, 'http://test');
        expect(url.pathname).toBe('/api/warehouse/reports/goods-receipts/materials/excel');
        expect(url.searchParams.has('length')).toBe(false);
        expect(url.searchParams.has('start')).toBe(false);
        expect(url.searchParams.has('search')).toBe(mode === 'filtered');
        return {
          data: new Blob(['test'], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        };
      });
      await purchaseService.export('materials', query, { mode, month: '2026-09' }, signal());
    },
  );
});

it('selector de compras admite el contrato de inventario sin type y rechaza un tipo explícito ajeno', () => {
  expect(mapPurchaseItemOption(material, 'materials').id).toBe(ids.material);
  expect(() =>
    mapPurchaseItemOption(
      { ...material, material: { ...material.material, type: 'CONSUMABLE' } },
      'materials',
    ),
  ).toThrow();
});
