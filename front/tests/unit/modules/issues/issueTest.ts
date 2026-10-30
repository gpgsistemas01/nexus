import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';
import { mountComposable } from '../../../helpers/mountComposable.js';
import { issueFor, issue, issueDetailId, issueId } from '../../../fixtures/issues.js';
import { material, ids, pageOf } from '../../../fixtures/inventory.js';
import { issueService } from '../../../../src/modules/issues/services/issueService.js';
import { issueLookupService } from '../../../../src/modules/issues/services/issueLookupService.js';
import {
  normalizeIssueDocument,
  mapIssueItemOption,
} from '../../../../src/modules/issues/mappers/issueResponseMapper.js';
import {
  createInitialIssueValues,
  emptyIssueFilters,
} from '../../../../src/modules/issues/issueForm.js';
import { mapIssueFormToRequest } from '../../../../src/modules/issues/mappers/issueRequestMapper.js';
import {
  createIssueDetailDraft,
  addIssueDetail,
} from '../../../../src/modules/issues/issueDetails.js';
import {
  resolveIssueEditMode,
  canSupplyIssue,
  canReturnIssue,
} from '../../../../src/modules/issues/issueRules.js';
import { initialRecordQuery } from '../../../../src/shared/list.js';
import { useIssueEditor } from '../../../../src/modules/issues/composables/useIssueEditor.js';
import { useIssueReturn } from '../../../../src/modules/issues/composables/useIssueReturn.js';
import { useIssueActions } from '../../../../src/modules/issues/composables/useIssueActions.js';

const signal = () => new AbortController().signal;
const document = () => normalizeIssueDocument(issue, 'materials');
const confirmation = { code: 'UPDATED_GOODS_ISSUE', message: 'Guardado' };
const originalAdapter = apiClient.http.defaults.adapter;
afterEach(() => {
  vi.restoreAllMocks();
  apiClient.http.defaults.adapter = originalAdapter;
});
describe('salidas Vue: contratos y modos', () => {
  it('la consulta de personas conserva los filtros múltiples y la señal de cancelación', async () => {
    const requestSignal = signal();
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      const url = new URL(config.url!, 'http://test');
      expect(url.pathname).toBe('/api/admin/persons');
      expect(url.searchParams.get('search')).toBe('Ana');
      expect(url.searchParams.get('start')).toBe('20');
      expect(url.searchParams.get('length')).toBe('20');
      expect(url.searchParams.getAll('role')).toEqual(['Coordinador', 'Instalador']);
      expect(url.searchParams.get('department')).toBe('IMPRESIÓN');
      expect(url.searchParams.get('strictDepartmentFilter')).toBe('true');
      expect(config.signal).toBe(requestSignal);
      return { data: pageOf([]) };
    });
    const result = await issueLookupService.list(
      {
        kind: 'persons',
        resource: 'materials',
        search: 'Ana',
        page: 2,
        filters: {
          role: ['Coordinador', 'Instalador'],
          department: 'IMPRESIÓN',
          strictDepartmentFilter: 'true',
        },
      },
      requestSignal,
    );
    expect(result.data).toEqual([]);
  });
  it('solicita áreas de Salidas filtradas por el servidor para los selectores y filtros', async () => {
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      const url = new URL(config.url!, 'http://test');
      expect(url.pathname).toBe('/api/admin/departments');
      expect(url.searchParams.get('context')).toBe('issues');
      expect(url.searchParams.get('search')).toBe('imp');
      return { data: pageOf([{ id: issue.departmentId, name: 'IMPRESIÓN' }]) };
    });
    const result = await issueLookupService.list(
      { kind: 'departments', resource: 'materials', search: 'imp', page: 1 },
      signal(),
    );
    expect(result.data.map(({ title }) => title)).toEqual(['IMPRESIÓN']);
  });
  it.each(['materials', 'consumables', 'wastes'] as const)(
    'lee y escribe %s con su contrato y código real',
    async (resource) => {
      const raw = issueFor(resource);
      apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
        const path =
          resource === 'wastes'
            ? '/api/warehouse/waste-issues'
            : `/api/warehouse/goods-issues/${resource}`;
        if (config.method === 'get') {
          expect(config.url).toBe(`${path}/${issueId}`);
          return { data: { [resource === 'wastes' ? 'wasteIssue' : 'goodsIssue']: raw } };
        }
        expect(config.url).toBe(path);
        return {
          data: { code: resource === 'wastes' ? 'CREATED_WASTE_ISSUE' : 'CREATED_GOODS_ISSUE' },
        };
      });
      const result = await issueService.get(resource, issueId, signal());
      expect(result.details[0]!.itemId).toBe(resource === 'wastes' ? ids.waste : ids.material);
      expect(result.requesterName).toBe(issue.requesterName);
      expect(
        (
          await issueService.save({
            resource,
            target: { mode: 'create' },
            payload: {},
            signal: signal(),
          })
        ).code,
      ).toMatch(/^CREATED_/);
    },
  );
  it.each(['materials', 'consumables', 'wastes'] as const)(
    'encabezado, surtido y devolución conservan endpoints y códigos de %s',
    async (resource) => {
      const calls: string[] = [];
      apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
        calls.push(config.url!);
        expect(config.method).toBe('patch');
        return {
          data: { code: resource === 'wastes' ? 'UPDATED_WASTE_ISSUE' : 'UPDATED_GOODS_ISSUE' },
        };
      });
      await issueService.save({
        resource,
        target: { mode: 'header', document: document() },
        payload: { observations: 'nota' },
        signal: signal(),
      });
      await issueService.save({
        resource,
        target: { mode: 'supply', document: document() },
        payload: { details: [] },
        signal: signal(),
      });
      await issueService.returnDetail({
        resource,
        documentId: issueId,
        detailId: issueDetailId,
        payload: { returnQuantity: 1 },
        signal: signal(),
      });
      const path =
        resource === 'wastes'
          ? '/api/warehouse/waste-issues'
          : `/api/warehouse/goods-issues/${resource}`;
      expect(calls).toEqual([
        `${path}/${issueId}/header`,
        `${path}/${issueId}/details`,
        `${path}/${issueId}/details/${issueDetailId}/returns`,
      ]);
    },
  );
  it('rechaza tipos cruzados, detalles duplicados y éxito de otro recurso', async () => {
    expect(() => normalizeIssueDocument(issue, 'consumables')).toThrow();
    expect(() =>
      normalizeIssueDocument(
        { ...issue, details: [issue.details[0], issue.details[0]] },
        'materials',
      ),
    ).toThrow();
    apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
      data: { code: 'CREATED_WASTE_ISSUE' },
    }));
    await expect(
      issueService.save({
        resource: 'materials',
        target: { mode: 'create' },
        payload: {},
        signal: signal(),
      }),
    ).rejects.toThrow(/confirmar/);
  });
  it.each([
    ['Pendiente', 'edit', true, false],
    ['Surtido parcial', 'header', true, false],
    ['Surtido', 'header', false, true],
    ['Cancelado', 'view', false, false],
  ] as const)('estado %s selecciona %s', (fulfillmentStatus, mode, supply, returns) => {
    const row = { ...document(), fulfillmentStatus };
    expect(resolveIssueEditMode(row)).toBe(mode);
    expect(canSupplyIssue(row)).toBe(supply);
    expect(canReturnIssue(row)).toBe(returns);
  });
  it('la selección distingue proveedor y material; agrupa sólo el mismo par', () => {
    const option = mapIssueItemOption(material, 'materials');
    const line = createIssueDetailDraft(option, 2, 'materials');
    expect(line).toMatchObject({
      supplierId: ids.supplier,
      itemId: ids.material,
      convertedQuantity: 200,
    });
    const merged = addIssueDetail([line], { ...line, quantity: 3, convertedQuantity: 300 });
    expect(merged[0]).toMatchObject({ quantity: 5, convertedQuantity: 500 });
    expect(line.quantity).toBe(2);
    expect(
      addIssueDetail([{ ...line, quantity: 2.1 }], { ...line, quantity: 2.2 })[0]!.quantity,
    ).toBe(4.3);
    expect(addIssueDetail([line], { ...line, supplierId: 'another' })).toHaveLength(2);
  });
  it.each(['materials', 'consumables'] as const)(
    'opciones de %s admiten inventario sin type y rechazan contradicciones explícitas',
    (resource) => {
      expect(mapIssueItemOption(material, resource).id).toBe(`${ids.material}:${ids.supplier}`);
      expect(() =>
        mapIssueItemOption(
          {
            ...material,
            material: {
              ...material.material,
              type: resource === 'materials' ? 'CONSUMABLE' : 'MATERIAL',
            },
          },
          resource,
        ),
      ).toThrow();
    },
  );
  it('cada modo envía sólo campos de su operación y no saldos calculados', () => {
    const values = createInitialIssueValues(document());
    expect(values.requestDate).toBe('2026-10-22T12:30');
    expect(mapIssueFormToRequest(values, 'materials', 'edit')).toMatchObject({
      details: [{ materialId: ids.material, supplierId: ids.supplier, quantity: 2 }],
    });
    expect(mapIssueFormToRequest(values, 'materials', 'header')).not.toHaveProperty('details');
    values.details[0]!.isSupplied = true;
    values.details[0]!.projectConvertedQuantity = '180';
    expect(mapIssueFormToRequest(values, 'materials', 'supply')).toEqual({
      details: [{ id: issueDetailId, isSupplied: true, projectConvertedQuantity: 180 }],
    });
    values.details[0]!.isOriginallySupplied = true;
    expect(mapIssueFormToRequest(values, 'materials', 'supply')).toEqual({ details: [] });
  });
  it('listado y Excel conservan filtros aplicados sin paginar el reporte', async () => {
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      const url = new URL(config.url!, 'http://test');
      expect(url.searchParams.get('observationsSearch')).toBe('captura');
      expect(url.searchParams.get('clientId')).toBe(issue.clientId);
      if (url.pathname.endsWith('/excel')) {
        expect(url.searchParams.has('length')).toBe(false);
        return {
          data: new Blob(['test'], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        };
      }
      expect(url.searchParams.get('length')).toBe('10');
      return { data: pageOf([issue]) };
    });
    const query = {
      ...initialRecordQuery(),
      ...emptyIssueFilters(),
      observationsSearch: 'captura',
      clientId: issue.clientId,
    };
    await issueService.list('materials', query, signal());
    await issueService.export('materials', query, { mode: 'filtered', month: '' }, signal());
  });
});
describe('salidas Vue: captura y efectos', () => {
  it('surtido exige selección y cantidad de proyecto; un fallo conserva captura sin repetir', async () => {
    vi.spyOn(issueLookupService, 'list').mockResolvedValue(pageOf([]));
    const save = vi
      .spyOn(issueService, 'save')
      .mockRejectedValueOnce(new Error('Stock insuficiente'))
      .mockResolvedValue(confirmation);
    const onSaved = vi.fn();
    const { value, wrapper } = mountComposable(() =>
      useIssueEditor({
        resource: 'materials',
        target: { mode: 'supply', document: document() },
        has: () => true,
        onSaved,
        onDenied: vi.fn(),
      }),
    );
    expect(value.errors.value).toEqual({});
    await value.submit();
    expect(save).not.toHaveBeenCalled();
    value.updateDetailSupply(issueDetailId, { isSupplied: true });
    await value.submit();
    expect(save).not.toHaveBeenCalled();
    value.updateDetailSupply(issueDetailId, { projectConvertedQuantity: '180' });
    await value.submit();
    expect(value.message.value).toBe('Stock insuficiente');
    expect(value.values.details[0]!.projectConvertedQuantity).toBe('180');
    expect(onSaved).not.toHaveBeenCalled();
    await value.submit();
    expect(save).toHaveBeenCalledTimes(2);
    expect(onSaved).toHaveBeenCalledWith(confirmation);
    expect(save.mock.calls[1]![0].target.mode).toBe('supply');
    wrapper.unmount();
  });
  it('devolución limita por el saldo leído, conserva precisión y exige reintento explícito', async () => {
    const detail = {
      ...document().details[0]!,
      suppliedQuantity: 2.12,
      returnedQuantity: 1.1,
      isSupplied: true,
    };
    const send = vi
      .spyOn(issueService, 'returnDetail')
      .mockRejectedValueOnce(new Error('Saldo cambió'))
      .mockResolvedValue(confirmation);
    const onSaved = vi.fn();
    const { value, wrapper } = mountComposable(() =>
      useIssueReturn({
        resource: 'materials',
        document: document(),
        detail,
        onSaved,
        onDenied: vi.fn(),
      }),
    );
    expect(value.availableQuantity).toBe(1.02);
    expect(value.errors.value).toEqual({});
    value.update('returnQuantity', '1.03');
    await value.submit();
    expect(send).not.toHaveBeenCalled();
    value.update('returnQuantity', '1.02');
    await value.submit();
    expect(value.message.value).toBe('Saldo cambió');
    expect(value.values.returnQuantity).toBe('1.02');
    await value.submit();
    expect(onSaved).toHaveBeenCalledWith(confirmation);
    wrapper.unmount();
    await value.submit();
    expect(send).toHaveBeenCalledTimes(2);
  });
  it('el modo se resuelve después de leer y no con el estado viejo del listado', async () => {
    const doc = { ...document(), fulfillmentStatus: 'Surtido' };
    vi.spyOn(issueService, 'get').mockResolvedValue(doc);
    const { value, wrapper } = mountComposable(() =>
      useIssueActions({
        resource: 'materials',
        canManage: () => true,
        canSupply: () => true,
        canRead: () => true,
        reload: vi.fn(),
        onError: vi.fn(),
      }),
    );
    await value.open(document(), 'edit');
    expect(value.editor.value?.mode).toBe('header');
    value.close();
    await value.open(document(), 'supply');
    expect(value.editor.value).toBeNull();
    expect(value.readError.value).toMatch(/estado/);
    wrapper.unmount();
  });
  it('no muestra errores iniciales; cliente/área reinician dependencias y filtran personas', async () => {
    const lookup = vi
      .spyOn(issueLookupService, 'list')
      .mockImplementation(async ({ kind }) =>
        pageOf(
          kind === 'clients'
            ? [{ id: issue.clientId, title: 'GPG INTERNO', data: {} }]
            : kind === 'departments'
              ? [{ id: issue.departmentId, title: 'SISTEMAS', data: {} }]
              : [],
        ),
      );
    const { value, wrapper } = mountComposable(() =>
      useIssueEditor({
        resource: 'materials',
        target: { mode: 'create' },
        has: () => true,
        onSaved: vi.fn(),
        onDenied: vi.fn(),
      }),
    );
    await flushPromises();
    value.blur('clientId');
    expect(value.errors.value).toEqual({});
    value.update('clientId', issue.clientId);
    value.update('departmentId', issue.departmentId);
    await flushPromises();
    expect(lookup.mock.calls.some(([query]) => query.filters?.role === 'Coordinador')).toBe(true);
    expect(lookup.mock.calls.some(([query]) => query.filters?.department === 'SISTEMAS')).toBe(
      true,
    );
    expect(value.values.projectNumber).toBe('120010');
    value.update('requesterId', issue.requesterId);
    value.update('departmentId', 'another');
    expect(value.values.requesterId).toBe('');
    wrapper.unmount();
  });
});

it('alta rápida de cliente conserva la opción fuera de la primera página y no modifica después del desmontaje', async () => {
  vi.spyOn(issueLookupService, 'list').mockResolvedValue(pageOf([]));
  const { value, wrapper } = mountComposable(() =>
    useIssueEditor({
      resource: 'materials',
      target: { mode: 'create' },
      has: () => true,
      onSaved: vi.fn(),
      onDenied: vi.fn(),
    }),
  );
  const option = { id: issue.clientId, title: 'Cliente nuevo', data: {} };
  value.headerSelection.selectCreatedClient(option);
  await flushPromises();
  expect(value.values.clientId).toBe(option.id);
  expect(value.headerSelection.initialOptions.value.clientId).toEqual(option);
  wrapper.unmount();
  value.headerSelection.selectCreatedClient({ ...option, id: 'otro' });
  expect(value.values.clientId).toBe(option.id);
});

it.each(['view', 'return'] as const)(
  'el modo %s conserva el documento e impide captura y escritura',
  async (mode) => {
    const save = vi.spyOn(issueService, 'save');
    const original = document();
    const { value, wrapper } = mountComposable(() =>
      useIssueEditor({
        resource: 'materials',
        target: { mode, document: original },
        has: () => true,
        onSaved: vi.fn(),
        onDenied: vi.fn(),
      }),
    );
    value.update('observations', 'Cambio indebido');
    await value.submit();
    expect(value.values.observations).toBe(original.observations);
    expect(value.errors.value).toEqual({});
    expect(save).not.toHaveBeenCalled();
    wrapper.unmount();
  },
);

it('el surtido protege detalles persistidos/cancelados y desmarcar limpia sólo la cantidad de proyecto de la captura', async () => {
  const original = document();
  original.details.push({
    ...original.details[0]!,
    id: 'persisted',
    isSupplied: true,
    isOriginallySupplied: true,
    projectConvertedQuantity: '80',
  });
  original.details.push({ ...original.details[0]!, id: 'canceled', isCanceled: true });
  const { value, wrapper } = mountComposable(() =>
    useIssueEditor({
      resource: 'materials',
      target: { mode: 'supply', document: original },
      has: () => true,
      onSaved: vi.fn(),
      onDenied: vi.fn(),
    }),
  );
  value.updateDetailSupply('persisted', { isSupplied: false, projectConvertedQuantity: '10' });
  value.updateDetailSupply('canceled', { isSupplied: true });
  value.updateDetailSupply(issueDetailId, { isSupplied: true, projectConvertedQuantity: '180' });
  value.updateDetailSupply(issueDetailId, { isSupplied: false });
  expect(value.values.details[0]).toMatchObject({
    isSupplied: false,
    projectConvertedQuantity: '',
  });
  expect(value.values.details[1]).toMatchObject({
    isSupplied: true,
    projectConvertedQuantity: '80',
  });
  expect(value.values.details[2]!.isSupplied).toBe(false);
  expect(original.details[0]!.projectConvertedQuantity).toBe('');
  wrapper.unmount();
});
