import { defineComponent, h, ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useInventoryList } from '../../../../src/modules/warehouse/composables/useInventoryList.js';
import { inventoryService } from '../../../../src/modules/warehouse/services/inventoryService.js';
import { normalizeInventoryRow } from '../../../../src/modules/warehouse/mappers/inventoryMapper.js';
import { material, pageOf } from '../../../fixtures/inventory.js';

const result = () => pageOf([normalizeInventoryRow(material)]);
const openList = (canRead = true) => {
  const paused = ref(false);
  let list!: ReturnType<typeof useInventoryList>;
  const request = vi.spyOn(inventoryService, 'list').mockResolvedValue(result());
  const wrapper = mount(
    defineComponent({
      setup() {
        list = useInventoryList({
          resource: 'materials',
          canRead,
          canReadSuppliers: false,
          isPaused: paused,
          onUnauthorized: vi.fn(),
        });
        return () => h('div');
      },
    }),
  );
  return { list, request, paused, wrapper };
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-21T12:00:00Z'));
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('una lectura reciente no se repite al recuperar foco; actualizar manualmente sí consulta', async () => {
  const { list, request } = openList();
  await flushPromises();
  window.dispatchEvent(new Event('focus'));
  await flushPromises();
  expect(request).toHaveBeenCalledTimes(1);
  await list.load();
  expect(request).toHaveBeenCalledTimes(2);
});

it('sin permiso de lectura no consulta al abrir, cambiar filtros ni actualizar manual o automáticamente', async () => {
  const { list, request } = openList(false);
  await flushPromises();
  list.applyQuery({ search: 'lona' });
  await list.load();
  await vi.advanceTimersByTimeAsync(30_000);
  window.dispatchEvent(new Event('focus'));
  await flushPromises();
  expect(request).not.toHaveBeenCalled();
  expect(list.rows.value).toEqual([]);
  expect(list.isLoading.value).toBe(false);
  expect(list.isRefreshing.value).toBe(false);
});

it('una página fuera del rango vuelve directamente a la última página disponible', async () => {
  const { list, request } = openList();
  await flushPromises();
  request
    .mockResolvedValueOnce({ data: [], recordsFiltered: 21, recordsTotal: 21 })
    .mockResolvedValueOnce({ ...result(), recordsFiltered: 21, recordsTotal: 21 });
  list.applyQuery({ page: 9 });
  await flushPromises();
  expect(list.query.page).toBe(3);
  expect(list.rows.value).toEqual(result().data);
  expect(request.mock.calls.map(([, query]) => query.page)).toEqual([1, 9, 3]);
  expect(list.isLoading.value).toBe(false);
});

it('la actualización automática conserva la tabla y no solapa consultas ni redibuja datos idénticos', async () => {
  const { list, request } = openList();
  await flushPromises();
  const original = list.rows.value;
  let finish!: (value: ReturnType<typeof result>) => void;
  request.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await vi.advanceTimersByTimeAsync(30_000);
  expect(request).toHaveBeenCalledTimes(2);
  expect(list.isRefreshing.value).toBe(true);
  expect(list.isLoading.value).toBe(false);
  expect(list.rows.value).toBe(original);
  window.dispatchEvent(new Event('focus'));
  await vi.advanceTimersByTimeAsync(30_000);
  expect(request).toHaveBeenCalledTimes(2);
  finish(result());
  await flushPromises();
  expect(list.rows.value).toBe(original);
  expect(list.isRefreshing.value).toBe(false);
});

it('pausa con modal o pestaña oculta y recupera datos vencidos al volver a la vista', async () => {
  const { list, request, paused } = openList();
  await flushPromises();
  paused.value = true;
  await vi.advanceTimersByTimeAsync(30_000);
  window.dispatchEvent(new Event('focus'));
  expect(request).toHaveBeenCalledTimes(1);
  paused.value = false;
  const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
  await vi.advanceTimersByTimeAsync(30_000);
  expect(request).toHaveBeenCalledTimes(1);
  request.mockResolvedValueOnce(
    pageOf([{ ...normalizeInventoryRow(material), currentStock: '99' }]),
  );
  visibility.mockReturnValue('visible');
  document.dispatchEvent(new Event('visibilitychange'));
  await flushPromises();
  expect(request).toHaveBeenCalledTimes(2);
  expect(list.rows.value[0]?.currentStock).toBe('99');
});

it('un fallo automático se puede reintentar y desmontar descarta respuestas y temporizadores', async () => {
  const { list, request, wrapper } = openList();
  await flushPromises();
  request.mockRejectedValueOnce(new Error('Sin conexión'));
  await vi.advanceTimersByTimeAsync(30_000);
  expect(list.error.value).toBe('Sin conexión');
  expect(list.rows.value).toHaveLength(1);
  window.dispatchEvent(new Event('focus'));
  await flushPromises();
  expect(request).toHaveBeenCalledTimes(2);
  await list.load();
  expect(list.error.value).toBe('');
  let finish!: (value: ReturnType<typeof result>) => void;
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
  finish(pageOf([]));
  await loading;
  await vi.advanceTimersByTimeAsync(60_000);
  window.dispatchEvent(new Event('focus'));
  expect(list.rows.value).toHaveLength(1);
  expect(request).toHaveBeenCalledTimes(4);
});
