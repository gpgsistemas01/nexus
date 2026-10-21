import { describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import { ApiError } from '../../../../src/shared/http/apiError.js';
import { createApiClient } from '../../../../src/shared/http/apiClient.js';
import { mockHttpAdapter } from '../../../helpers/httpAdapter.js';

describe('cliente Axios compartido: sesión y errores', () => {
  it('comparte una renovación entre solicitudes concurrentes y reintenta sólo el 401', async () => {
    let isRefreshed = false;
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const respond = vi.fn(async ({ url }: { url?: string }) => {
      if (url === '/api/auth/refresh') {
        await pending;
        isRefreshed = true;
        return { data: { code: 'REFRESH_SUCCESS' } };
      }
      return {
        status: isRefreshed ? 200 : 401,
        data: isRefreshed ? { data: [] } : { code: 'INVALID_AUTH' },
      };
    });
    const { request } = createApiClient(mockHttpAdapter(respond));
    const requests = [request('/api/warehouse/materials'), request('/api/warehouse/wastes')];
    await vi.waitFor(() =>
      expect(
        respond.mock.calls.filter(([config]) => config.url === '/api/auth/refresh'),
      ).toHaveLength(1),
    );
    finish();
    await expect(Promise.all(requests)).resolves.toEqual([{ data: [] }, { data: [] }]);
    expect(
      respond.mock.calls.filter(([config]) => config.url === '/api/warehouse/materials'),
    ).toHaveLength(2);
  });

  it.each([403, 409, 500])(
    'no renueva ni repite una escritura rechazada con %s',
    async (status) => {
      const respond = vi.fn(() => ({ status, data: { code: 'UNKNOWN' } }));
      await expect(
        createApiClient(mockHttpAdapter(respond)).request('/api/warehouse/materials/id/stock', {
          method: 'PATCH',
        }),
      ).rejects.toMatchObject({ status });
      expect(respond).toHaveBeenCalledTimes(1);
    },
  );

  it('conserva el rechazo de sesión si también falla la renovación', async () => {
    const respond = vi.fn(() => ({ status: 401, data: { code: 'INVALID_AUTH' } }));
    await expect(
      createApiClient(mockHttpAdapter(respond)).request('/api/auth/me'),
    ).rejects.toMatchObject({ status: 401 });
    expect(respond).toHaveBeenCalledTimes(2);
  });

  it('un segundo 401 termina el reintento y no genera un bucle de renovación', async () => {
    const respond = vi.fn(({ url }: { url?: string }) => ({
      status: url === '/api/auth/refresh' ? 200 : 401,
      data: {},
    }));
    await expect(
      createApiClient(mockHttpAdapter(respond)).request('/api/auth/me'),
    ).rejects.toMatchObject({ status: 401 });
    expect(respond).toHaveBeenCalledTimes(3);
  });

  it('no reenvía escrituras después de un error de red', async () => {
    const respond = vi.fn(() => {
      throw new AxiosError('red interrumpida', 'ERR_NETWORK');
    });
    await expect(
      createApiClient(mockHttpAdapter(respond)).request('/api/warehouse/wastes', {
        method: 'POST',
        data: { operationId: 'captura' },
      }),
    ).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(respond).toHaveBeenCalledTimes(1);
  });

  it('descarta una solicitud cancelada sin mostrarla como un fallo de red', async () => {
    const controller = new AbortController();
    controller.abort();
    const respond = vi.fn(() => ({ data: {} }));
    await expect(
      createApiClient(mockHttpAdapter(respond)).request('/api/auth/me', {
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ code: 'ERR_CANCELED' });
    expect(respond).not.toHaveBeenCalled();
  });

  it('rechaza HTML de un proxy como resultado JSON válido', async () => {
    const { request } = createApiClient(mockHttpAdapter(() => ({ data: '<html>Login</html>' })));
    await expect(request('/api/warehouse/materials')).rejects.toBeInstanceOf(ApiError);
  });
});

it('normaliza errores JSON de una descarga Blob sin perder los campos', async () => {
  const payload = new Blob(
    [JSON.stringify({ code: 'VALIDATION_ERROR', errors: { name: { code: 'USERNAME_REQUIRED' } } })],
    { type: 'application/json' },
  );
  const { request } = createApiClient(mockHttpAdapter(() => ({ status: 400, data: payload })));
  await expect(
    request('/api/warehouse/reports/inventory/excel', { responseType: 'blob' }),
  ).rejects.toMatchObject({ status: 400, fieldErrors: { name: expect.any(String) } });
});
