import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { useCatalogList } from '../../../../src/modules/catalogs/composables/useCatalogList.js';
import { catalogService } from '../../../../src/modules/catalogs/services/catalogService.js';
const entry = { id: 'role-1', name: 'Operador', symbol: '', isActive: true, version: 3 };
const page = (name: string) => ({
  data: [{ ...entry, name }],
  recordsTotal: 1,
  recordsFiltered: 1,
});
const openList = () => {
  let list!: ReturnType<typeof useCatalogList>;
  const denied = vi.fn();
  const wrapper = mount(
    defineComponent({
      setup() {
        list = useCatalogList('roles', denied);
        return () => h('div');
      },
    }),
  );
  return { list, wrapper, denied };
};
afterEach(() => vi.restoreAllMocks());
it('cambiar búsqueda cancela la lectura anterior y descarta su respuesta tardía', async () => {
  let finish!: (value: ReturnType<typeof page>) => void;
  const request = vi
    .spyOn(catalogService, 'list')
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValueOnce(page('Resultado nuevo'));
  const { list } = openList();
  list.applyQuery({ search: 'nuevo' });
  await flushPromises();
  expect(request.mock.calls[0]![2]!.aborted).toBe(true);
  finish(page('Resultado viejo'));
  await flushPromises();
  expect(list.rows.value.map((row) => row.name)).toEqual(['Resultado nuevo']);
  expect(list.query.page).toBe(1);
  expect(list.isLoading.value).toBe(false);
});
it('una página vacía vuelve a una página válida; desmontar impide publicar lecturas tardías', async () => {
  const request = vi
    .spyOn(catalogService, 'list')
    .mockResolvedValueOnce(page('Actual'))
    .mockResolvedValueOnce({ data: [], recordsTotal: 1, recordsFiltered: 1 })
    .mockResolvedValueOnce(page('Página válida'));
  const { list, wrapper } = openList();
  await flushPromises();
  list.applyQuery({ page: 3 });
  await flushPromises();
  expect(list.query.page).toBe(1);
  expect(list.rows.value[0]?.name).toBe('Página válida');
  let finish!: (value: ReturnType<typeof page>) => void;
  request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const loading = list.load();
  const signal = request.mock.calls.at(-1)![2]!;
  wrapper.unmount();
  expect(signal.aborted).toBe(true);
  finish(page('Respuesta desmontada'));
  await loading;
  expect(list.rows.value[0]?.name).toBe('Página válida');
});
