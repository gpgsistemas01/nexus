import { nextTick } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { useMovementFilters } from '../../../../src/modules/movements/composables/useMovementFilters.js';
import { movementService } from '../../../../src/modules/movements/services/movementService.js';
import { mountComposable } from '../../../helpers/mountComposable.js';
import type { LookupItem } from '../../../../src/shared/lookup.js';
import type { PageResult } from '../../../../src/shared/http/pageRequest.js';
const optionPage = (id: string): PageResult<LookupItem> => ({
  data: [{ id, title: id, data: {} }],
  recordsFiltered: 1,
  recordsTotal: 1,
});
afterEach(() => vi.restoreAllMocks());
it('requiere proveedor, limpia el material inmediatamente y descarta opciones tardías', async () => {
  let finish!: (result: PageResult<LookupItem>) => void;
  const lookup = vi
    .spyOn(movementService, 'lookup')
    .mockImplementation((resource, _search, _page, supplier) =>
      resource === 'suppliers'
        ? Promise.resolve(optionPage('proveedor'))
        : supplier === 'primero'
          ? new Promise((resolve) => {
              finish = resolve;
            })
          : Promise.resolve(optionPage('material-segundo')),
    );
  const { value: filters, wrapper } = mountComposable(() =>
    useMovementFilters('materials', () => true),
  );
  await flushPromises();
  expect(lookup.mock.calls.map((call) => call[0])).toEqual(['suppliers']);
  filters.update('supplierId', 'primero');
  await nextTick();
  const previousSignal = lookup.mock.calls.find((call) => call[3] === 'primero')![4];
  filters.update('itemId', 'material-primero');
  filters.update('supplierId', 'segundo');
  expect(filters.values.itemId).toBe('');
  await nextTick();
  await flushPromises();
  expect(previousSignal.aborted).toBe(true);
  finish(optionPage('material-tardío'));
  await flushPromises();
  expect(filters.items.items.value.map((item) => item.id)).toEqual(['material-segundo']);
  filters.clear();
  await nextTick();
  expect(filters.values.supplierId).toBe('');
  expect(filters.items.items.value).toEqual([]);
  wrapper.unmount();
});
it('sin permisos de selectores no consulta datos auxiliares', async () => {
  const lookup = vi.spyOn(movementService, 'lookup');
  const { value, wrapper } = mountComposable(() =>
    useMovementFilters('materials', (permission) => permission === 'movements:read'),
  );
  value.update('supplierId', 'manipulado');
  await nextTick();
  await flushPromises();
  expect(lookup).not.toHaveBeenCalled();
  expect(value.canSelectItem.value).toBe(false);
  wrapper.unmount();
});
