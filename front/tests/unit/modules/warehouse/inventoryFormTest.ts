import { inventoryCatalogService } from '../../../../src/modules/warehouse/services/inventoryCatalogService.js';
import { normalizeInventoryRow } from '../../../../src/modules/warehouse/mappers/inventoryMapper.js';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useInventoryEditor } from '../../../../src/modules/warehouse/composables/useInventoryEditor.js';
import { inventoryService } from '../../../../src/modules/warehouse/services/inventoryService.js';
import { ApiError } from '../../../../src/shared/http/apiError.js';
import { ids, material, pageOf, template, user, waste } from '../../../fixtures/inventory.js';
import type {
  EditorTarget,
  InventoryField,
  InventoryResource,
} from '../../../../src/modules/warehouse/inventory.js';

const openEditor = (resource: InventoryResource, target: EditorTarget) => {
  let editor!: ReturnType<typeof useInventoryEditor>;
  const saved = vi.fn();
  vi.spyOn(inventoryCatalogService, 'lookup').mockResolvedValue(pageOf([]));
  const request = vi
    .spyOn(inventoryService, 'mutate')
    .mockResolvedValue({ code: 'UPDATED_MATERIAL' });
  const wrapper = mount(
    defineComponent({
      setup() {
        editor = useInventoryEditor({
          resource,
          target,
          userId: user.id,
          onSaved: saved,
          onUnauthorized: vi.fn(),
        });
        return () => h('div');
      },
    }),
  );
  return { editor, saved, request, wrapper };
};
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('captura Vue de inventario: contratos y reintentos (DP-VUE-WH-002/003)', () => {
  it.each(['materials', 'consumables'] as const)(
    'selecciona proveedor creado en %s sin perder captura ni depender de la página remota',
    async (resource) => {
      const { editor, wrapper } = openEditor(resource, {
        action: 'create',
        initialName: 'Nombre buscado',
      });
      expect(editor.values.name).toBe('Nombre buscado');
      const created = { id: ids.supplier, title: 'Proveedor nuevo', data: {} };
      editor.selectCreatedSupplier({ ...created, isDisabled: true });
      expect(editor.values.supplierId).toBe('');
      expect(editor.message.value).toContain('inactivo');
      editor.selectCreatedSupplier(created);
      await flushPromises();
      expect(editor.values.supplierId).toBe(ids.supplier);
      expect(editor.selectedSupplier.value).toEqual(created);
      expect(editor.values.name).toBe('Nombre buscado');
      wrapper.unmount();
      editor.selectCreatedSupplier({ ...created, id: 'otro' });
      expect(editor.values.supplierId).toBe(ids.supplier);
    },
  );
  it.each(['materials', 'consumables', 'wastes'] as const)(
    'abrir %s y perder el foco sin capturar no muestra errores; enviar sí valida',
    async (resource) => {
      const { editor, request } = openEditor(resource, { action: 'create' });
      await flushPromises();
      await editor.blur('name');
      await editor.blur('supplierId');
      expect(editor.errors.value).toEqual({});
      editor.update('name', ' ');
      await editor.blur('name');
      expect(editor.errors.value.name).toBeTruthy();
      expect(editor.errors.value.supplierId).toBeUndefined();
      await editor.submit();
      expect(editor.errors.value.supplierId).toBeTruthy();
      expect(request).not.toHaveBeenCalled();
    },
  );
  it.each(['materials', 'consumables'] as const)(
    'eliminar %s usa la relación con el proveedor y no el id del material',
    async (resource) => {
      const { editor, request } = openEditor(resource, {
        action: 'delete',
        row: normalizeInventoryRow(material),
      });
      await editor.submit();
      expect(request).toHaveBeenCalledWith(
        resource,
        'delete',
        {},
        ids.offer,
        expect.any(AbortSignal),
      );
    },
  );
  it.each(['materials', 'consumables'] as const)(
    'editar %s conserva las dos versiones leídas y omite identidad y stock',
    async (resource) => {
      const { editor, request, saved } = openEditor(resource, {
        action: 'edit',
        row: normalizeInventoryRow(material),
      });
      editor.update('name', 'Lona actualizada');
      await editor.submit();
      expect(request).toHaveBeenCalledWith(
        resource,
        'edit',
        {
          name: 'Lona actualizada',
          minStock: 5,
          maxUnitCost: 100,
          isActive: true,
          supplierId: ids.supplier,
          expectedVersion: 3,
          expectedMaterialVersion: 7,
        },
        ids.material,
        expect.any(AbortSignal),
      );
      expect(saved).toHaveBeenCalledOnce();
    },
  );

  it.each(['materials', 'consumables', 'wastes'] as const)(
    'ajustar %s conserva el saldo capturado y la versión original',
    async (resource) => {
      const row = normalizeInventoryRow(resource === 'wastes' ? waste : material);
      const { editor, request } = openEditor(resource, { action: 'stock', row });
      editor.update('newStock', '12.5');
      editor.update('reasonId', ids.reason);
      await editor.submit();
      expect(request.mock.calls[0]?.[2]).toEqual({
        newStock: 12.5,
        reasonId: ids.reason,
        observations: '',
        expectedVersion: row.version,
        ...(resource === 'wastes' ? {} : { supplierId: ids.supplier }),
      });
    },
  );

  it.each([
    ['newStock', '-1'],
    ['newStock', 'no'],
    ['reasonId', ''],
    ['reasonId', 'otro'],
  ] as const)('bloquea un ajuste con %s=%s antes de enviar', async (field, value) => {
    const { editor, request } = openEditor('materials', {
      action: 'stock',
      row: normalizeInventoryRow(material),
    });
    editor.update('reasonId', ids.reason);
    editor.update(field, value);
    await editor.submit();
    expect(request).not.toHaveBeenCalled();
    expect(editor.errors.value[field]).toBeTruthy();
  });

  it('crear un consumible omite medidas aunque se manipule su estado local', async () => {
    const { editor, request } = openEditor('consumables', { action: 'create' });
    for (const [field, value] of Object.entries({
      name: 'Cinta',
      supplierId: ids.supplier,
      presentationId: ids.presentation,
      unitMeasureId: ids.unit,
      base: '2',
      height: '3',
    })) {
      editor.update(field as InventoryField, value);
    }
    await editor.submit();
    expect(request).toHaveBeenCalledOnce();
    expect(request.mock.calls[0]?.[2]).not.toHaveProperty('base');
    expect(request.mock.calls[0]?.[2]).not.toHaveProperty('height');
  });

  it.each(['materials', 'wastes'] as const)(
    'editar %s sin costo recibido exige capturarlo y admite cero explícito',
    async (resource) => {
      const data = resource === 'wastes' ? waste : material;
      const { editor, request } = openEditor(resource, {
        action: 'edit',
        row: normalizeInventoryRow({ ...data, maxUnitCost: undefined }),
      });
      await editor.submit();
      expect(request).not.toHaveBeenCalled();
      expect(editor.errors.value.maxUnitCost).toBeTruthy();
      editor.update('maxUnitCost', '0');
      await editor.submit();
      expect(request).toHaveBeenCalledOnce();
      expect(request.mock.calls[0]?.[2].maxUnitCost).toBe(0);
    },
  );

  it('cambiar proveedor elimina la referencia y la captura heredada de la merma anterior', async () => {
    const { editor, request } = openEditor('wastes', { action: 'create' });
    vi.mocked(inventoryCatalogService.lookup).mockImplementation(async ({ path }) =>
      pageOf(
        path === 'wastes/material-templates'
          ? [{ id: ids.material, title: 'Lona', data: template }]
          : [],
      ),
    );
    editor.update('supplierId', ids.supplier);
    await flushPromises();
    editor.update('materialId', ids.material);
    await flushPromises();
    expect(editor.values.name).toBe('Lona');
    editor.update('referenceRollTotalWeightKg', '10.25');
    editor.update('coneWeightKg', '0.25');
    editor.update('totalWeightKg', '2.75');
    editor.update('supplierId', '99999999-9999-4999-8999-999999999999');
    await flushPromises();
    for (const field of [
      'materialId',
      'name',
      'maxUnitCost',
      'referenceRollTotalWeightKg',
      'coneWeightKg',
      'totalWeightKg',
      'base',
      'height',
    ] as const)
      expect(editor.values[field]).toBe('');
    expect(request).not.toHaveBeenCalled();
  });

  it('editar merma envía sólo sus metadatos y la versión, sin pesos ni medidas', async () => {
    const { editor, request } = openEditor('wastes', {
      action: 'edit',
      row: normalizeInventoryRow(waste),
    });
    await editor.submit();
    expect(request.mock.calls[0]?.[2]).toEqual({
      name: waste.name,
      minStock: 1,
      maxUnitCost: 40,
      isActive: true,
      expectedVersion: 2,
    });
  });

  it('conserva cantidad y operationId tras una respuesta incierta y al volver a abrir', async () => {
    const first = openEditor('wastes', { action: 'add-stock', row: normalizeInventoryRow(waste) });
    first.request.mockRejectedValueOnce(new ApiError('Conexión interrumpida'));
    first.editor.update('quantity', '3');
    first.editor.update('observations', 'Conteo revisado');
    await first.editor.submit();
    const original = first.request.mock.calls[0]![2];
    expect(original.operationId).toMatch(/^[\da-f-]{36}$/);
    expect(first.editor.isPending.value).toBe(true);
    first.wrapper.unmount();
    vi.restoreAllMocks();
    const second = openEditor('wastes', { action: 'add-stock', row: normalizeInventoryRow(waste) });
    second.editor.update('quantity', '999');
    await second.editor.submit();
    expect(second.request.mock.calls[0]?.[2]).toEqual(original);
    expect(localStorage.length).toBe(0);
  });

  it('sin almacenamiento disponible no envía una nueva operación de merma', async () => {
    const { editor, request } = openEditor('wastes', {
      action: 'add-stock',
      row: normalizeInventoryRow(waste),
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Almacenamiento no disponible');
    });
    editor.update('quantity', '2');
    await editor.submit();
    expect(request).not.toHaveBeenCalled();
    expect(editor.message.value).toContain('Almacenamiento');
  });

  it('un conflicto no cambia la versión ni reenvía automáticamente la escritura', async () => {
    const { editor, request, saved } = openEditor('materials', {
      action: 'stock',
      row: normalizeInventoryRow(material),
    });
    request.mockRejectedValue(new ApiError('El registro cambió', 409, 'RECORD_VERSION_CONFLICT'));
    editor.update('reasonId', ids.reason);
    await editor.submit();
    expect(editor.isConflicted.value).toBe(true);
    expect(saved).not.toHaveBeenCalled();
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[2].expectedVersion).toBe(3);
  });

  it('al desmontar, una confirmación tardía no cierra ni actualiza otra pantalla', async () => {
    const { editor, wrapper, request, saved } = openEditor('materials', {
      action: 'edit',
      row: normalizeInventoryRow(material),
    });
    let finish!: (value: { code: string }) => void;
    request.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const submitting = editor.submit();
    await vi.waitFor(() => expect(request).toHaveBeenCalledOnce());
    wrapper.unmount();
    finish({ code: 'UPDATED_MATERIAL' });
    await submitting;
    await flushPromises();
    expect(saved).not.toHaveBeenCalled();
  });
});
