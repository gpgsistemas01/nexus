import { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createApiClient } from '../../../../src/shared/http/apiClient.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const failure = (config: InternalAxiosRequestConfig, code: number | string) => {
  if (typeof code === 'string') throw new AxiosError('Conexión interrumpida', code, config);
  return { status: code, data: '' };
};

it.each([502, 503, 504, 'ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET'])(
  'recupera una consulta tras el fallo transitorio %s sin intervención del usuario',
  async (code) => {
    const respond = vi.fn((config: InternalAxiosRequestConfig) =>
      respond.mock.calls.length === 1 ? failure(config, code) : { data: { data: [] } },
    );
    const result = createApiClient(mockHttpAdapter(respond)).request('/api/warehouse/materials');
    await vi.advanceTimersByTimeAsync(499);
    expect(respond).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toEqual({ data: [] });
    expect(respond).toHaveBeenCalledTimes(2);
  },
);

it('limita una caída persistente a tres intentos y conserva el último error HTTP', async () => {
  const respond = vi.fn(() => ({ status: 502, data: 'Bad Gateway' }));
  const result = createApiClient(mockHttpAdapter(respond))
    .request('/api/auth/me')
    .catch((cause: unknown) => cause);
  await vi.runAllTimersAsync();
  expect(await result).toMatchObject({ status: 502 });
  expect(respond).toHaveBeenCalledTimes(3);
  expect(vi.getTimerCount()).toBe(0);
});

it.each([400, 401, 403, 409, 429, 500])(
  'no considera HTTP %s un corte transitorio de conexión',
  async (status) => {
    const respond = vi.fn(() => ({ status, data: {} }));
    const result = createApiClient(mockHttpAdapter(respond))
      .request('/api/auth/me', { requiresAuth: false })
      .catch((cause: unknown) => cause);
    await vi.runAllTimersAsync();
    expect(await result).toMatchObject({ status });
    expect(respond).toHaveBeenCalledOnce();
  },
);

it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
  'no repite una escritura %s tras un fallo del proxy',
  async (method) => {
    const respond = vi.fn(() => ({ status: 503, data: {} }));
    const result = createApiClient(mockHttpAdapter(respond))
      .request('/api/warehouse/materials', { method })
      .catch((cause: unknown) => cause);
    await vi.runAllTimersAsync();
    expect(await result).toMatchObject({ status: 503 });
    expect(respond).toHaveBeenCalledOnce();
  },
);

it('comparte el refresh y su recuperación automática entre dos consultas con 401', async () => {
  let refreshCalls = 0;
  let isRefreshed = false;
  const respond = vi.fn(({ url }: InternalAxiosRequestConfig) => {
    if (url === '/api/auth/refresh') {
      refreshCalls++;
      if (refreshCalls === 1) return { status: 502, data: '' };
      isRefreshed = true;
      return { data: 'OK' };
    }
    return isRefreshed ? { data: { data: [] } } : { status: 401, data: {} };
  });
  const { request } = createApiClient(mockHttpAdapter(respond));
  const result = Promise.all([request('/api/auth/me'), request('/api/warehouse/materials')]);
  await vi.advanceTimersByTimeAsync(0);
  expect(refreshCalls).toBe(1);
  await vi.runAllTimersAsync();
  await expect(result).resolves.toEqual([{ data: [] }, { data: [] }]);
  expect(refreshCalls).toBe(2);
  expect(respond).toHaveBeenCalledTimes(6);
});

it('abortar durante la espera cancela el temporizador y evita otra consulta', async () => {
  const controller = new AbortController();
  const respond = vi.fn(() => ({ status: 502, data: '' }));
  const result = createApiClient(mockHttpAdapter(respond))
    .request('/api/auth/me', { signal: controller.signal })
    .catch((cause: unknown) => cause);
  await vi.advanceTimersByTimeAsync(0);
  controller.abort();
  await expect(result).resolves.toMatchObject({ code: 'ERR_CANCELED' });
  await vi.runAllTimersAsync();
  expect(respond).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});

it('cancelar una consulta no cancela la recuperación compartida del refresh', async () => {
  const controller = new AbortController();
  let refreshCalls = 0;
  let isRefreshed = false;
  const respond = vi.fn(({ url }: InternalAxiosRequestConfig) => {
    if (url === '/api/auth/refresh') {
      refreshCalls++;
      if (refreshCalls === 1) return { status: 503, data: '' };
      isRefreshed = true;
      return { data: 'OK' };
    }
    return isRefreshed ? { data: {} } : { status: 401, data: {} };
  });
  const { request } = createApiClient(mockHttpAdapter(respond));
  const results = Promise.allSettled([
    request('/api/auth/me', { signal: controller.signal }),
    request('/api/warehouse/materials'),
  ]);
  await vi.advanceTimersByTimeAsync(0);
  controller.abort();
  await vi.runAllTimersAsync();
  const [canceled, recovered] = await results;
  expect(canceled).toMatchObject({ status: 'rejected', reason: { code: 'ERR_CANCELED' } });
  expect(recovered).toMatchObject({ status: 'fulfilled', value: {} });
  expect(refreshCalls).toBe(2);
});
