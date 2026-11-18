import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PUBLIC_CATALOGS } from '@nexus/catalogs';
import { useCatalogEditor } from '../../../../src/modules/catalogs/composables/useCatalogEditor.js';
import { catalogService } from '../../../../src/modules/catalogs/services/catalogService.js';
import { ApiError } from '../../../../src/shared/http/apiError.js';
import type { CatalogName, CatalogTarget } from '../../../../src/modules/catalogs/catalog.js';

const entry = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Metro',
  symbol: 'm',
  isActive: true,
  version: 7,
};
const openEditor = (
  catalog: CatalogName = 'unit-measures',
  target: CatalogTarget = { action: 'create' },
) => {
  let editor!: ReturnType<typeof useCatalogEditor>;
  const saved = vi.fn();
  const denied = vi.fn();
  const request = vi.spyOn(catalogService, 'save').mockResolvedValue(entry);
  const wrapper = mount(
    defineComponent({
      setup() {
        editor = useCatalogEditor({ catalog, target, onSaved: saved, onDenied: denied });
        return () => h('div');
      },
    }),
  );
  return { editor, saved, denied, request, wrapper };
};
afterEach(() => vi.restoreAllMocks());

describe('Catálogos Vue: captura y versiones (DP-VUE-CAT-002)', () => {
  it.each(Object.keys(PUBLIC_CATALOGS).filter((name) => name !== 'materials') as CatalogName[])(
    'crear %s usa sólo sus campos públicos y admite estado inactivo',
    async (catalog) => {
      const { editor, request } = openEditor(catalog);
      await editor.blur('name');
      expect(editor.errors.value).toEqual({});
      editor.update('name', ' Nuevo registro ');
      editor.update('symbol', ' m ');
      editor.update('isActive', false);
      await editor.submit();
      expect(request).toHaveBeenCalledWith(
        catalog,
        { action: 'create' },
        {
          name: 'Nuevo registro',
          isActive: false,
          ...(catalog === 'unit-measures' ? { symbol: 'm' } : {}),
        },
        expect.any(AbortSignal),
      );
    },
  );
  it.each([
    ['unit-measures', 'name', '', false],
    ['unit-measures', 'name', 'a'.repeat(20), true],
    ['unit-measures', 'name', 'a'.repeat(21), false],
    ['unit-measures', 'symbol', '', false],
    ['unit-measures', 'symbol', 'a'.repeat(10), true],
    ['unit-measures', 'symbol', 'a'.repeat(11), false],
    ['roles', 'name', 'a'.repeat(50), true],
    ['roles', 'name', 'a'.repeat(51), false],
    ['reasons', 'name', 'a'.repeat(100), true],
    ['reasons', 'name', 'a'.repeat(101), false],
  ] as const)(
    '%s %s: captura en la frontera admitida=%s',
    async (catalog, field, value, isValid) => {
      const { editor, request } = openEditor(catalog);
      editor.update('name', 'Metro');
      editor.update('symbol', 'm');
      editor.update(field, value);
      await editor.submit();
      expect(request.mock.calls.length).toBe(isValid ? 1 : 0);
      expect(Boolean(editor.errors.value[field])).toBe(!isValid);
    },
  );
  it('validar un campo editado no muestra errores del símbolo intacto', async () => {
    const { editor } = openEditor();
    editor.update('name', ' ');
    await editor.blur('name');
    expect(editor.errors.value.name).toBeTruthy();
    expect(editor.errors.value.symbol).toBeUndefined();
  });
  it.each(['RECORD_VERSION_CONFLICT', 'MATERIAL_IDENTITY_LINKED'])(
    'un conflicto %s conserva la versión y exige actualizar',
    async (code) => {
      const target = { action: 'edit', row: entry } as const;
      const { editor, request, saved } = openEditor('unit-measures', target);
      request.mockRejectedValueOnce(new ApiError('El registro cambió', 409, code));
      editor.update('name', 'Metro actualizado');
      await editor.submit();
      await editor.submit();
      expect(request).toHaveBeenCalledTimes(1);
      expect(request.mock.calls[0]![2]).toEqual({
        name: 'Metro actualizado',
        symbol: 'm',
        isActive: true,
        expectedVersion: 7,
      });
      expect(editor.values.name).toBe('Metro actualizado');
      expect(editor.isConflicted.value).toBe(true);
      expect(saved).not.toHaveBeenCalled();
    },
  );
  it.each([401, 403])(
    'un rechazo %s sale del formulario sin confirmar un guardado',
    async (status) => {
      const { editor, request, denied, saved } = openEditor('roles');
      request.mockRejectedValueOnce(new ApiError('Sin acceso', status));
      editor.update('name', 'Operador');
      await editor.submit();
      expect(denied).toHaveBeenCalledWith(status);
      expect(saved).not.toHaveBeenCalled();
    },
  );
  it('un fallo permite corregir y reintentar; no solapa envíos ni confirma tras desmontar', async () => {
    const { editor, request, saved, wrapper } = openEditor('roles');
    request.mockRejectedValueOnce(new ApiError('Sin conexión'));
    editor.update('name', 'Operador');
    await editor.submit();
    expect(editor.message.value).toBe('Sin conexión');
    let finish!: (value: typeof entry) => void;
    request.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const pending = editor.submit();
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    await editor.submit();
    expect(request).toHaveBeenCalledTimes(2);
    wrapper.unmount();
    expect(request.mock.calls[1]![3]!.aborted).toBe(true);
    finish(entry);
    await pending;
    await flushPromises();
    expect(saved).not.toHaveBeenCalled();
  });
});

it('crear Material valida identidad sin proveedor; editar sólo envía nombre, mínimo y versión', async () => {
  const create = openEditor('materials');
  create.editor.update('name', 'Consumible');
  await create.editor.submit();
  expect(create.request).not.toHaveBeenCalled();
  create.editor.update('type', 'CONSUMABLE');
  create.editor.update('presentationId', entry.id);
  create.editor.update('unitMeasureId', entry.id);
  await create.editor.submit();
  expect(create.request).toHaveBeenCalledWith(
    'materials',
    { action: 'create' },
    {
      name: 'Consumible',
      type: 'CONSUMABLE',
      presentationId: entry.id,
      unitMeasureId: entry.id,
      base: null,
      height: null,
    },
    expect.any(AbortSignal),
  );
  create.wrapper.unmount();
  vi.restoreAllMocks();
  const edit = openEditor('materials', {
    action: 'edit',
    row: {
      id: entry.id,
      name: 'Material',
      hasSuppliers: true,
      symbol: '',
      version: 2,
      type: 'MATERIAL',
      presentationId: entry.id,
      unitMeasureId: entry.id,
      base: '2',
      height: '3',
      minStock: '0',
    },
  });
  edit.editor.update('name', 'Actualizado');
  edit.editor.update('minStock', '5');
  await edit.editor.submit();
  expect(edit.request).toHaveBeenCalledWith(
    'materials',
    expect.objectContaining({ action: 'edit' }),
    { name: 'Actualizado', minStock: 5, expectedVersion: 2 },
    expect.any(AbortSignal),
  );
  edit.wrapper.unmount();
});

it('editar un artículo sin proveedor permite cambiar toda su identidad', async () => {
  const { editor, request, wrapper } = openEditor('materials', {
    action: 'edit',
    row: {
      ...entry,
      type: 'MATERIAL',
      presentationId: entry.id,
      unitMeasureId: entry.id,
      base: '2',
      height: '3',
      minStock: '0',
      hasSuppliers: false,
    },
  });
  editor.update('type', 'CONSUMABLE');
  editor.update('base', '');
  editor.update('height', '');
  await editor.submit();
  expect(request).toHaveBeenCalledWith(
    'materials',
    expect.anything(),
    expect.objectContaining({
      type: 'CONSUMABLE',
      presentationId: entry.id,
      unitMeasureId: entry.id,
      base: null,
      height: null,
      expectedVersion: entry.version,
    }),
    expect.any(AbortSignal),
  );
  wrapper.unmount();
});

it.each(['MATERIAL', 'CONSUMABLE'] as const)(
  'alta contextual precarga el nombre y el tipo %s y devuelve el registro creado',
  async (materialType) => {
    const target = { action: 'create' as const, initialName: 'Artículo buscado', materialType };
    const { editor, saved, request, wrapper } = openEditor('materials', target);
    expect(editor.values.name).toBe('Artículo buscado');
    expect(editor.values.type).toBe(materialType);
    editor.update('presentationId', entry.id);
    editor.update('unitMeasureId', entry.id);
    await editor.submit();
    expect(request).toHaveBeenCalledWith(
      'materials',
      target,
      expect.objectContaining({ name: 'Artículo buscado', type: materialType }),
      expect.any(AbortSignal),
    );
    expect(saved).toHaveBeenCalledWith(entry);
    wrapper.unmount();
  },
);
