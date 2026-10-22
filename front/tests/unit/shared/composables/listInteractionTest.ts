import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePagedList } from '../../../../src/shared/composables/usePagedList.js';
import { useListSearch } from '../../../../src/shared/composables/useListSearch.js';
import { useListEditor } from '../../../../src/shared/composables/useListEditor.js';
import { showSuccess } from '../../../../src/shared/ui/feedback.js';
import { initialRecordQuery } from '../../../../src/shared/list.js';
import { mountComposable } from '../../../helpers/mountComposable.js';
import { pageOf } from '../../../fixtures/inventory.js';

vi.mock('../../../../src/shared/ui/feedback.js', () => ({ showSuccess: vi.fn() }));
afterEach(() => vi.clearAllMocks());

const openList = () => {
  const department = ref('');
  const request = vi.fn(async () => ({
    ...pageOf([{ id: 'registro-1' }]),
    recordsTotal: 20,
    recordsFiltered: 20,
  }));
  const mounted = mountComposable(() => {
    const list = usePagedList({
      initialQuery: { ...initialRecordQuery(), department: '' },
      request,
      errorMessage: 'No se pudo cargar.',
      onError: vi.fn(),
    });
    return { list, ...useListSearch(list, () => ({ department: department.value })) };
  });
  return { ...mounted, department, request };
};

describe('interacción de listados compartida (DP-VUE-LIST-001)', () => {
  it('buscar desde otra página vuelve a la primera y repetir actualiza una sola vez', async () => {
    const { value, request } = openList();
    await flushPromises();
    value.list.applyQuery({ page: 2, length: 1 });
    await flushPromises();
    value.search.value = 'Proveedor';
    value.applySearch();
    await flushPromises();
    expect(value.list.query).toMatchObject({ page: 1, length: 1, search: 'Proveedor' });
    const count = request.mock.calls.length;
    value.applySearch();
    await flushPromises();
    expect(request).toHaveBeenCalledTimes(count + 1);
  });

  it('cambiar sólo un filtro conserva búsqueda, orden y tamaño sin confundirlo con actualizar', async () => {
    const { value, department, request } = openList();
    await flushPromises();
    value.search.value = 'Ana';
    value.applySearch();
    await flushPromises();
    value.list.applyQuery({ page: 2, length: 1, direction: 'desc' });
    await flushPromises();
    department.value = 'VENTAS';
    const count = request.mock.calls.length;
    value.applySearch();
    await flushPromises();
    expect(value.list.query).toMatchObject({
      page: 1,
      length: 1,
      search: 'Ana',
      department: 'VENTAS',
      direction: 'desc',
    });
    expect(request).toHaveBeenCalledTimes(count + 1);
  });

  it('limpiar reinicia texto, filtros y página conservando tamaño y orden', async () => {
    const { value } = openList();
    await flushPromises();
    value.list.applyQuery({
      page: 2,
      length: 1,
      direction: 'desc',
      search: 'Ana',
      department: 'VENTAS',
    });
    await flushPromises();
    value.search.value = 'borrador sin aplicar';
    value.clearSearch({ department: '' });
    await flushPromises();
    expect(value.search.value).toBe('');
    expect(value.list.query).toMatchObject({
      page: 1,
      length: 1,
      direction: 'desc',
      search: '',
      department: '',
    });
  });

  it('dos páginas mantienen independientes su búsqueda y sus filtros', async () => {
    const first = openList();
    const second = openList();
    await flushPromises();
    first.value.search.value = 'Primera';
    first.department.value = 'ALMACÉN';
    first.value.applySearch();
    await flushPromises();
    expect(second.value.search.value).toBe('');
    expect(second.value.list.query).toMatchObject({ search: '', department: '' });
    expect(second.request).toHaveBeenCalledTimes(1);
  });

  it('el editor distingue cerrar, recargar por conflicto y guardar; reevalúa permisos al abrir', () => {
    const allowed = ref(true);
    const reload = vi.fn();
    const { value } = mountComposable(() =>
      useListEditor<{ version: number }>({
        canOpen: () => allowed.value,
        reload,
        savedMessage: 'Guardado de prueba',
      }),
    );
    value.openEditor({ version: 3 });
    value.closeEditor();
    expect(value.editor.value).toBeNull();
    expect(reload).not.toHaveBeenCalled();
    value.openEditor({ version: 3 });
    value.reloadEditor();
    expect(value.editor.value).toBeNull();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(showSuccess).not.toHaveBeenCalled();
    allowed.value = false;
    value.openEditor({ version: 4 });
    expect(value.editor.value).toBeNull();
    allowed.value = true;
    value.openEditor({ version: 4 });
    value.onSaved();
    expect(value.editor.value).toBeNull();
    expect(reload).toHaveBeenCalledTimes(2);
    expect(showSuccess).toHaveBeenCalledWith('Guardado de prueba');
  });
});
