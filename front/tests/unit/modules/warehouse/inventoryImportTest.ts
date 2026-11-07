import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { ApiError } from '../../../../src/shared/http/apiError.js';
import { inventoryImportService } from '../../../../src/modules/warehouse/services/inventoryImportService.js';
import { pendingInventoryImport } from '../../../../src/modules/warehouse/services/pendingInventoryImport.js';
import { useInventoryImport } from '../../../../src/modules/warehouse/composables/useInventoryImport.js';
import { mountComposable } from '../../../helpers/mountComposable.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';
import { ids } from '../../../fixtures/inventory.js';
import { inventoryImportDraft as draft } from '../../../fixtures/inventoryImport.js';

const originalAdapter = apiClient.http.defaults.adapter;
beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  apiClient.http.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

describe('contrato de importación y recuperación', () => {
  it('envía un solo multipart para la vista previa y confirma con JSON y clave estable', async () => {
    const batch = draft();
    const transport = vi.fn((config) =>
      config.url!.includes('preview')
        ? { data: { code: 'INVENTORY_IMPORT_PREVIEW', batch } }
        : {
            data: {
              code: 'INVENTORY_IMPORT_COMPLETED',
              batch: { ...batch, status: 'COMPLETED', preview: null, result: batch.preview },
            },
          },
    );
    apiClient.http.defaults.adapter = mockHttpAdapter(transport);
    const file = new File(['xlsx'], 'materiales.xlsx');
    await inventoryImportService.preview('materials', 'create', file, new AbortController().signal);
    expect(transport.mock.calls[0]![0].data).toBeInstanceOf(FormData);
    expect((transport.mock.calls[0]![0].data as FormData).get('file')).toBe(file);
    const pending = { id: batch.id, expectedVersion: batch.version, operationId: ids.offer };
    await inventoryImportService.confirm(pending, new AbortController().signal);
    expect(transport.mock.calls[1]![0].headers.get('Content-Type')).toBe('application/json');
    expect(transport.mock.calls.every(([config]) => config.timeout === 45000)).toBe(true);
    expect(JSON.parse(transport.mock.calls[1]![0].data as string)).toEqual({
      expectedVersion: 0,
      operationId: ids.offer,
    });
  });
  it('rechaza un 200 sin confirmación o con datos incompletos', async () => {
    apiClient.http.defaults.adapter = mockHttpAdapter(() => ({
      data: { code: 'INVENTORY_IMPORT_COMPLETED', batch: { id: ids.material, version: 0 } },
    }));
    await expect(
      inventoryImportService.confirm(
        { id: ids.material, expectedVersion: 0, operationId: ids.offer },
        new AbortController().signal,
      ),
    ).rejects.toThrow('leer la importación');
  });
  it('almacena sólo la referencia de confirmación, separada por cuenta y recurso', () => {
    const storage = pendingInventoryImport(ids.user, 'materials');
    const pending = {
      id: ids.material,
      expectedVersion: 3,
      operationId: ids.offer,
      rows: ['dato privado'],
    };
    storage.save(pending);
    expect(storage.read()).toEqual({
      id: ids.material,
      expectedVersion: 3,
      operationId: ids.offer,
    });
    expect(localStorage.getItem(localStorage.key(0)!)).not.toContain('privado');
    expect(pendingInventoryImport(ids.supplier, 'materials').read()).toBeNull();
    expect(pendingInventoryImport(ids.user, 'wastes').read()).toBeNull();
  });
  it('conserva la clave al perder la respuesta y la recupera desde una nueva instancia sin duplicar', async () => {
    const batch = draft();
    const completed = {
      ...batch,
      status: 'COMPLETED' as const,
      preview: null,
      result: batch.preview,
    };
    const confirm = vi
      .spyOn(inventoryImportService, 'confirm')
      .mockRejectedValueOnce(new ApiError('Red', 0));
    const get = vi.spyOn(inventoryImportService, 'get').mockResolvedValue(completed);
    const saved = vi.fn();
    let mounted = mountComposable(() =>
      useInventoryImport({
        resource: 'materials',
        userId: ids.user,
        onSaved: saved,
        onUnauthorized: vi.fn(),
      }),
    );
    mounted.value.batch.value = batch;
    await mounted.value.confirm();
    const pending = pendingInventoryImport(ids.user, 'materials').read();
    expect(pending?.operationId).toMatch(/^[a-f0-9-]{36}$/);
    expect(mounted.value.recoveryRequired.value).toBe(true);
    mounted.wrapper.unmount();
    mounted = mountComposable(() =>
      useInventoryImport({
        resource: 'materials',
        userId: ids.user,
        onSaved: saved,
        onUnauthorized: vi.fn(),
      }),
    );
    await mounted.value.recover();
    expect(get).toHaveBeenCalledWith(batch.id, expect.any(AbortSignal));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(saved).toHaveBeenCalledOnce();
    expect(pendingInventoryImport(ids.user, 'materials').read()).toBeNull();
    mounted.wrapper.unmount();
  });
  it('una respuesta tardía tras desmontar no borra la referencia de otra captura', async () => {
    const batch = draft();
    let complete!: (value: ReturnType<typeof draft>) => void;
    vi.spyOn(inventoryImportService, 'confirm').mockReturnValue(
      new Promise((resolve) => {
        complete = resolve;
      }),
    );
    const saved = vi.fn();
    const mounted = mountComposable(() =>
      useInventoryImport({
        resource: 'materials',
        userId: ids.user,
        onSaved: saved,
        onUnauthorized: vi.fn(),
      }),
    );
    mounted.value.batch.value = batch;
    const attempt = mounted.value.confirm();
    mounted.wrapper.unmount();
    const next = { id: ids.waste, expectedVersion: 0, operationId: ids.supplier };
    pendingInventoryImport(ids.user, 'materials').save(next);
    complete({ ...batch, status: 'COMPLETED', preview: null, result: batch.preview });
    await attempt;
    expect(pendingInventoryImport(ids.user, 'materials').read()).toEqual(next);
    expect(saved).not.toHaveBeenCalled();
  });
  it('un borrador al consultar reintenta el mismo comando y no crea otro lote', async () => {
    const batch = draft();
    const pending = { id: batch.id, expectedVersion: 0, operationId: ids.offer };
    pendingInventoryImport(ids.user, 'materials').save(pending);
    vi.spyOn(inventoryImportService, 'get').mockResolvedValue(batch);
    const confirm = vi
      .spyOn(inventoryImportService, 'confirm')
      .mockResolvedValue({ ...batch, status: 'COMPLETED', preview: null, result: batch.preview });
    const preview = vi.spyOn(inventoryImportService, 'preview');
    const mounted = mountComposable(() =>
      useInventoryImport({
        resource: 'materials',
        userId: ids.user,
        onSaved: vi.fn(),
        onUnauthorized: vi.fn(),
      }),
    );
    await mounted.value.recover();
    expect(confirm).toHaveBeenCalledWith(pending, expect.any(AbortSignal));
    expect(preview).not.toHaveBeenCalled();
    mounted.wrapper.unmount();
  });
  it('rechaza tamaño y extensión antes de enviar y bloquea confirmación con errores', async () => {
    const preview = vi.spyOn(inventoryImportService, 'preview');
    const confirm = vi.spyOn(inventoryImportService, 'confirm');
    const mounted = mountComposable(() =>
      useInventoryImport({
        resource: 'materials',
        userId: ids.user,
        onSaved: vi.fn(),
        onUnauthorized: vi.fn(),
      }),
    );
    mounted.value.selectFile(new File(['xlsx'], 'materiales.csv'));
    await mounted.value.prepare();
    expect(mounted.value.error.value).toContain('2 MiB');
    expect(preview).not.toHaveBeenCalled();
    const batch = draft();
    batch.preview!.summary.errors = 1;
    mounted.value.batch.value = batch;
    await mounted.value.confirm();
    expect(confirm).not.toHaveBeenCalled();
    mounted.wrapper.unmount();
  });
});
