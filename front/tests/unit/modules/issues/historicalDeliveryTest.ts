import type { InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { ApiError } from '../../../../src/shared/http/apiError.js';
import { historicalDeliveryService } from '../../../../src/modules/issues/services/historicalDeliveryService.js';
import { pendingHistoricalDelivery } from '../../../../src/modules/issues/services/pendingHistoricalDelivery.js';
import { useHistoricalDelivery } from '../../../../src/modules/issues/composables/useHistoricalDelivery.js';
import { normalizeIssueDocument } from '../../../../src/modules/issues/mappers/issueResponseMapper.js';
import { useIssueReturn } from '../../../../src/modules/issues/composables/useIssueReturn.js';
import { issueService } from '../../../../src/modules/issues/services/issueService.js';
import { issueFor } from '../../../fixtures/issues.js';
import {
  historicalPreview,
  historicalReceipt,
  historicalCommand,
} from '../../../fixtures/historicalDelivery.js';
import { ids } from '../../../fixtures/inventory.js';
import { mountComposable } from '../../../helpers/mountComposable.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';

const originalAdapter = apiClient.http.defaults.adapter;
beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  apiClient.http.defaults.adapter = originalAdapter;
});
const mount = async () => {
  const preview = vi
    .spyOn(historicalDeliveryService, 'preview')
    .mockResolvedValue(historicalPreview());
  const mounted = mountComposable(() =>
    useHistoricalDelivery({
      resource: 'materials',
      userId: ids.user,
      onSaved: vi.fn(),
      onUnauthorized: vi.fn(),
    }),
  );
  await vi.waitFor(() =>
    expect(
      mounted.value.preview.value?.documents.length || mounted.value.recoveryRequired.value,
    ).toBeTruthy(),
  );
  return { ...mounted, preview };
};

describe('registro histórico: contrato, selección explícita y recuperación durable', () => {
  it('separa la recuperación por cuenta y recurso y guarda únicamente la captura necesaria', () => {
    const storage = pendingHistoricalDelivery(ids.user, 'materials');
    const command = { ...historicalCommand(), snapshot: 'Datos que no deben persistirse' };
    storage.save(command);
    expect(storage.read()).toEqual(historicalCommand());
    expect(localStorage.getItem(localStorage.key(0)!)).not.toContain('snapshot');
    expect(pendingHistoricalDelivery(ids.supplier, 'materials').read()).toBeNull();
    expect(pendingHistoricalDelivery(ids.user, 'wastes').read()).toBeNull();
  });
  it('envía sólo las revisiones originales y una declaración explícita, sin saldos calculados', async () => {
    const transport = vi.fn((config: InternalAxiosRequestConfig) => {
      expect(config.method).toBe('post');
      return { data: { code: 'HISTORICAL_DELIVERY_COMPLETED', receipt: historicalReceipt() } };
    });
    apiClient.http.defaults.adapter = mockHttpAdapter(transport);
    const command = historicalCommand();
    await historicalDeliveryService.confirm('materials', command, new AbortController().signal);
    expect(JSON.parse(transport.mock.calls[0]![0].data as string)).toEqual(command);
  });
  it('carga las salidas del corte sin aplicar filtros de texto', async () => {
    let url = '';
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      url = config.url ?? '';
      return { data: { preview: historicalPreview() } };
    });
    await historicalDeliveryService.preview(
      'materials',
      { cutoffDate: historicalPreview().cutoffDate, page: 1 },
      new AbortController().signal,
    );
    const query = new URL(url, 'http://localhost').searchParams;
    expect(query.get('cutoffDate')).toBe(historicalPreview().cutoffDate);
    expect(query.get('page')).toBe('1');
    expect(query.has('search')).toBe(false);
  });
  it('carga automáticamente las salidas usando la hora actual como corte', async () => {
    const mounted = await mount();
    const [resource, query] = mounted.preview.mock.calls[0]!;
    expect(resource).toBe('materials');
    expect(Number.isFinite(Date.parse(query.cutoffDate))).toBe(true);
    expect(query.page).toBe(1);
    expect(mounted.value.preview.value?.documents).toEqual(historicalPreview().documents);
    mounted.wrapper.unmount();
  });
  it('la pérdida de respuesta y la recarga reintentan la misma captura y clave', async () => {
    const send = vi
      .spyOn(historicalDeliveryService, 'confirm')
      .mockRejectedValueOnce(new ApiError('Red', 0))
      .mockResolvedValueOnce(historicalReceipt());
    let mounted = await mount();
    mounted.value.preview.value = historicalPreview();
    await mounted.value.selectAll();
    mounted.value.values.reason = 'Entrega física comprobada';
    expect(mounted.value.canConfirm.value).toBe(false);
    mounted.value.values.declaredDelivered = true;
    await mounted.value.confirm();
    expect(mounted.value.recoveryRequired.value).toBe(true);
    const original = send.mock.calls[0]![1];
    expect(original.deliveredAt).toBeNull();
    mounted.wrapper.unmount();
    mounted = await mount();
    expect(mounted.value.recoveryRequired.value).toBe(true);
    await mounted.value.recover();
    expect(send.mock.calls[1]![1]).toEqual(original);
    expect(mounted.value.receipt.value).toEqual(historicalReceipt());
    expect(mounted.value.recoveryRequired.value).toBe(false);
    expect(localStorage.length).toBe(0);
    mounted.wrapper.unmount();
  });
  it('un conflicto definitivo exige volver a leer antes de confirmar', async () => {
    const mounted = await mount();
    mounted.value.preview.value = historicalPreview();
    await mounted.value.selectAll();
    mounted.value.values.reason = 'Entregado';
    mounted.value.values.declaredDelivered = true;
    vi.spyOn(historicalDeliveryService, 'confirm').mockRejectedValue(
      new ApiError('Cambió', 409, 'RECORD_VERSION_CONFLICT'),
    );
    await mounted.value.confirm();
    expect(mounted.value.preview.value).toBeNull();
    expect(mounted.value.recoveryRequired.value).toBe(false);
    mounted.wrapper.unmount();
  });
  it('seleccionar todo carga todas las páginas y conserva las revisiones seleccionadas', async () => {
    const mounted = await mount();
    mounted.value.preview.value = { ...historicalPreview(), hasMore: true };
    const secondPage = {
      ...historicalPreview(),
      page: 2,
      documents: [
        {
          ...historicalPreview().documents[0]!,
          id: ids.material,
          revision: 'b'.repeat(64),
          referenceNumber: 'SMA-HIST-002',
        },
      ],
    };
    const cutoffDate = mounted.preview.mock.calls[0]![1].cutoffDate;
    mounted.preview.mockResolvedValue(secondPage);
    await mounted.value.selectAll();
    expect(mounted.preview).toHaveBeenCalledWith(
      'materials',
      {
        cutoffDate,
        page: 2,
      },
      expect.any(AbortSignal),
    );
    expect(mounted.value.selected.value).toEqual([
      historicalPreview().documents[0]!.id,
      ids.material,
    ]);
    expect(mounted.value.allSelected.value).toBe(true);
    mounted.value.toggle(historicalPreview().documents[0]!.id);
    expect(mounted.value.selected.value).toEqual([ids.material]);
    expect(mounted.value.allSelected.value).toBe(false);
    mounted.wrapper.unmount();
  });
  it('no selecciona resultados globales que exceden el límite de un lote', async () => {
    const mounted = await mount();
    mounted.value.preview.value = {
      ...historicalPreview(),
      hasMore: true,
      documents: Array.from({ length: 100 }, (_, index) => ({
        ...historicalPreview().documents[0]!,
        id: `document-${index}`,
      })),
    };
    mounted.preview.mockResolvedValue({
      ...historicalPreview(),
      page: 2,
      documents: [{ ...historicalPreview().documents[0]!, id: 'document-101' }],
    });
    await mounted.value.selectAll();
    expect(mounted.value.selected.value).toEqual([]);
    expect(mounted.value.allSelected.value).toBe(false);
    expect(mounted.value.error.value).toContain('más de 100 salidas');
    mounted.wrapper.unmount();
  });
  it('rechaza respuestas incompletas o de otro recurso aunque el HTTP sea 200', async () => {
    apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
      data: {
        code: 'HISTORICAL_DELIVERY_COMPLETED',
        receipt: { ...historicalReceipt(), resource: 'wastes' },
      },
    }));
    await expect(
      historicalDeliveryService.confirm(
        'materials',
        historicalCommand(),
        new AbortController().signal,
      ),
    ).rejects.toThrow('incompleta');
  });
  it('un recibo con folios repetidos no confirma una selección distinta del mismo tamaño', async () => {
    const receipt = historicalReceipt();
    const command = historicalCommand();
    command.documents.push({ id: ids.material, revision: 'b'.repeat(64) });
    receipt.documents.push({ ...receipt.documents[0]! });
    apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
      data: { code: 'HISTORICAL_DELIVERY_COMPLETED', receipt },
    }));
    await expect(
      historicalDeliveryService.confirm('materials', command, new AbortController().signal),
    ).rejects.toThrow('incompleta');
  });
  it('una devolución histórica requiere confirmación física y la transmite al servidor', async () => {
    const evidence = {
      id: ids.offer,
      cutoffDate: historicalPreview().cutoffDate,
      deliveredAt: null,
      createdAt: '2026-11-01T12:00:00Z',
      reason: 'Entregado',
      user: { name: 'Sistemas' },
    };
    const raw = issueFor('materials');
    raw.details[0]!.suppliedQuantity = '2';
    raw.details[0]!.isSupplied = true;
    const document = normalizeIssueDocument(
      { ...raw, historicalDeliveryBatch: evidence },
      'materials',
    );
    const send = vi
      .spyOn(issueService, 'returnDetail')
      .mockResolvedValue({ code: 'UPDATED_GOODS_ISSUE', message: 'Guardado' });
    const mounted = mountComposable(() =>
      useIssueReturn({
        resource: 'materials',
        document,
        detail: document.details[0]!,
        onSaved: vi.fn(),
        onDenied: vi.fn(),
      }),
    );
    mounted.value.update('returnQuantity', '1');
    await mounted.value.submit();
    expect(send).not.toHaveBeenCalled();
    mounted.value.update('physicalReturnConfirmed', true);
    await mounted.value.submit();
    expect(send.mock.calls[0]![0].payload).toEqual({
      returnQuantity: 1,
      observations: '',
      physicalReturnConfirmed: true,
    });
    mounted.wrapper.unmount();
  });
});
