import type { PageResult } from '../../../../src/shared/http/pageRequest.js';
import { defineComponent, h, nextTick, ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { useRemoteOptions } from '../../../../src/modules/warehouse/composables/useRemoteOptions.js';
import { inventoryCatalogService } from '../../../../src/modules/warehouse/services/inventoryCatalogService.js';
import { apiClient } from '../../../../src/shared/http/apiClient.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';
import { ids, pageOf } from '../../../fixtures/inventory.js';
import type { LookupItem } from '../../../../src/shared/lookup.js';

const option = (id: string): LookupItem => ({ id, title: id, data: {} });
const page = (id: string): PageResult<LookupItem> => ({
  data: [option(id)],
  recordsFiltered: 1,
  recordsTotal: 1,
});
const originalAdapter = apiClient.http.defaults.adapter;
afterEach(() => {
  vi.restoreAllMocks();
  apiClient.http.defaults.adapter = originalAdapter;
});

it.each(['suppliers', 'wastes/material-templates'] as const)(
  '%s conserva búsqueda, proveedor, página y señal en la consulta HTTP',
  async (path) => {
    const requestSignal = new AbortController().signal;
    const supplierId = path === 'wastes/material-templates' ? ids.supplier : undefined;
    apiClient.http.defaults.adapter = mockHttpAdapter((config) => {
      const url = new URL(config.url!, 'http://test');
      expect(url.pathname).toBe(`/api/warehouse/${path}`);
      expect(url.searchParams.get('search')).toBe('Lona');
      expect(url.searchParams.get('start')).toBe('20');
      expect(url.searchParams.get('length')).toBe('20');
      expect(url.searchParams.get('supplierId')).toBe(supplierId ?? '');
      expect(url.searchParams.get('onlyActive')).toBe(path === 'suppliers' ? 'true' : null);
      expect(config.signal).toBe(requestSignal);
      return { data: pageOf([]) };
    });
    const result = await inventoryCatalogService.lookup(
      { path, search: 'Lona', page: 2, supplierId },
      requestSignal,
    );
    expect(result.data).toEqual([]);
  },
);

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
  expect(lookup.mock.calls[0]?.[1]?.aborted).toBe(true);
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
  expect(lookup.mock.calls[0]?.[1]?.aborted).toBe(true);
  finish(page('proveedor tardío'));
  await flushPromises();
  expect(options.items.value).toEqual([]);
});
