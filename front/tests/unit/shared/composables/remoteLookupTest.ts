import { nextTick, ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { useRemoteLookup } from '../../../../src/shared/composables/useRemoteLookup.js';
import type { LookupItem } from '../../../../src/shared/lookup.js';
import type { PageResult } from '../../../../src/shared/http/pageRequest.js';
import { mountComposable } from '../../../helpers/mountComposable.js';

const result = (ids: string[], total = ids.length): PageResult<LookupItem> => ({
  data: ids.map((id) => ({ id, title: id, data: {} })),
  recordsFiltered: total,
  recordsTotal: total,
});
afterEach(() => vi.useRealTimers());

it('avanza por filas recibidas y termina aunque se repitan IDs entre páginas o dentro de una página', async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(result(['uno', 'uno', 'dos'], 7))
    .mockResolvedValueOnce(result(['dos', 'tres'], 7))
    .mockResolvedValueOnce(result(['tres', 'cuatro'], 7));
  const { value } = mountComposable(() => useRemoteLookup(request, ref(true)));
  await flushPromises();
  expect(value.items.value.map((item) => item.id)).toEqual(['uno', 'dos']);
  await value.loadMore();
  await value.loadMore();
  expect(value.items.value.map((item) => item.id)).toEqual(['uno', 'dos', 'tres', 'cuatro']);
  expect(value.hasMore.value).toBe(false);
  await value.loadMore();
  expect(request.mock.calls.map((call) => call[1])).toEqual([1, 2, 3]);
});
it('una página vacía termina la carga cuando el conteo del servidor quedó desactualizado', async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(result(['uno'], 99))
    .mockResolvedValueOnce(result([], 99));
  const { value } = mountComposable(() => useRemoteLookup(request, ref(true)));
  await flushPromises();
  await value.loadMore();
  expect(value.state.value).toMatchObject({ hasMore: false, isLoading: false, error: '' });
  expect(value.items.value.map((item) => item.id)).toEqual(['uno']);
  await value.loadMore();
  expect(request).toHaveBeenCalledTimes(2);
});
it('reintentar una página fallida no avanza el contador ni omite resultados', async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(result(['uno'], 2))
    .mockRejectedValueOnce(new Error('Sin conexión'))
    .mockResolvedValueOnce(result(['dos'], 2));
  const { value } = mountComposable(() => useRemoteLookup(request, ref(true)));
  await flushPromises();
  await value.loadMore();
  expect(value.error.value).toBe('Sin conexión');
  expect(value.items.value.map((item) => item.id)).toEqual(['uno']);
  await value.retry();
  expect(value.items.value.map((item) => item.id)).toEqual(['uno', 'dos']);
  expect(value.hasMore.value).toBe(false);
  expect(request.mock.calls.map((call) => call[1])).toEqual([1, 2, 2]);
});
it('cambiar la búsqueda invalida el reintento de la página vieja y cancela el debounce al reintentar', async () => {
  vi.useFakeTimers();
  const request = vi
    .fn()
    .mockResolvedValueOnce(result(['uno'], 3))
    .mockRejectedValueOnce(new Error('Sin conexión'))
    .mockResolvedValueOnce(result(['nuevo']));
  const { value } = mountComposable(() => useRemoteLookup(request, ref(true)));
  await flushPromises();
  await value.loadMore();
  value.updateSearch('nueva búsqueda');
  expect(value.error.value).toBe('');
  await value.retry();
  await vi.advanceTimersByTimeAsync(300);
  expect(request.mock.calls.map((call) => [call[0], call[1]])).toEqual([
    ['', 1],
    ['', 2],
    ['nueva búsqueda', 1],
  ]);
  expect(value.items.value.map((item) => item.id)).toEqual(['nuevo']);
});
it('deshabilitar el catálogo limpia errores y opciones; habilitarlo comienza otra vez en la primera página', async () => {
  const enabled = ref(true);
  const request = vi
    .fn()
    .mockRejectedValueOnce(new Error('Sin permiso'))
    .mockResolvedValueOnce(result(['autorizado']));
  const { value } = mountComposable(() => useRemoteLookup(request, enabled));
  await flushPromises();
  expect(value.error.value).toBe('Sin permiso');
  enabled.value = false;
  await nextTick();
  await value.retry();
  expect(value.state.value).toEqual({ items: [], isLoading: false, error: '', hasMore: false });
  expect(request).toHaveBeenCalledTimes(1);
  enabled.value = true;
  await nextTick();
  await flushPromises();
  expect(value.items.value.map((item) => item.id)).toEqual(['autorizado']);
  expect(request.mock.calls.at(-1)?.[1]).toBe(1);
});
it('desmontar cancela la petición y el debounce y bloquea callbacks conservados por el consumidor', async () => {
  vi.useFakeTimers();
  let finish!: (value: PageResult<LookupItem>) => void;
  const request = vi.fn<
    (search: string, page: number, signal: AbortSignal) => Promise<PageResult<LookupItem>>
  >(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const { value, wrapper } = mountComposable(() => useRemoteLookup(request, ref(true)));
  value.updateSearch('consulta pendiente');
  const signal = request.mock.calls[0]![2];
  wrapper.unmount();
  value.updateSearch('después de desmontar');
  await value.retry();
  await value.refresh();
  await value.loadMore();
  finish(result(['tardío']));
  await vi.advanceTimersByTimeAsync(300);
  await flushPromises();
  expect(signal.aborted).toBe(true);
  expect(request).toHaveBeenCalledTimes(1);
  expect(value.state.value).toEqual({ items: [], isLoading: false, error: '', hasMore: false });
});

it('refrescar un catálogo vuelve a la primera página y sustituye opciones tras una alta', async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(result(['uno'], 2))
    .mockResolvedValueOnce(result(['dos'], 2))
    .mockResolvedValueOnce(result(['nuevo', 'uno'], 3));
  const { value } = mountComposable(() => useRemoteLookup(request, ref(true)));
  await flushPromises();
  await value.loadMore();
  await value.refresh();
  expect(request.mock.calls.map((call) => call[1])).toEqual([1, 2, 1]);
  expect(value.items.value.map((item) => item.id)).toEqual(['nuevo', 'uno']);
  expect(value.hasMore.value).toBe(true);
});
