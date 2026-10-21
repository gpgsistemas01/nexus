import { defineComponent, h, nextTick, ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { useRemoteOptions } from '../../../../src/modules/warehouse/composables/useRemoteOptions.js';
import { inventoryCatalogService } from '../../../../src/modules/warehouse/services/inventoryCatalogService.js';
import type { LookupItem, PageResult } from '../../../../src/modules/warehouse/inventory.js';

const option = (id: string): LookupItem => ({ id, title: id, data: {} });
const page = (id: string): PageResult<LookupItem> => ({
  data: [option(id)],
  recordsFiltered: 1,
  recordsTotal: 1,
});
afterEach(() => vi.restoreAllMocks());

it('cambiar proveedor invalida opciones anteriores y descarta su respuesta tardía', async () => {
  let finish!: (value: PageResult<LookupItem>) => void;
  const lookup = vi
    .spyOn(inventoryCatalogService, 'lookup')
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValueOnce(page('material del segundo proveedor'));
  const supplier = ref('proveedor inicial');
  let options!: ReturnType<typeof useRemoteOptions>;
  mount(
    defineComponent({
      setup() {
        options = useRemoteOptions('wastes/material-templates', ref(true), supplier);
        return () => h('div');
      },
    }),
  );
  supplier.value = 'segundo proveedor';
  await nextTick();
  await flushPromises();
  expect(options.items.value.map((item) => item.id)).toEqual(['material del segundo proveedor']);
  expect(lookup.mock.calls[0]?.[4]?.aborted).toBe(true);
  finish(page('material del proveedor inicial'));
  await flushPromises();
  expect(options.items.value.map((item) => item.id)).toEqual(['material del segundo proveedor']);
});

it('desmontar cancela la consulta y no conserva sus opciones tardías', async () => {
  let finish!: (value: PageResult<LookupItem>) => void;
  const lookup = vi.spyOn(inventoryCatalogService, 'lookup').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let options!: ReturnType<typeof useRemoteOptions>;
  const wrapper = mount(
    defineComponent({
      setup() {
        options = useRemoteOptions('suppliers', ref(true));
        return () => h('div');
      },
    }),
  );
  wrapper.unmount();
  expect(lookup.mock.calls[0]?.[4]?.aborted).toBe(true);
  finish(page('proveedor tardío'));
  await flushPromises();
  expect(options.items.value).toEqual([]);
});
