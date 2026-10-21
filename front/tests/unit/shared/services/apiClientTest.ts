import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, createApiClient } from '../../../../src/shared/services/apiClient.js';

afterEach(() => vi.restoreAllMocks());
describe('cliente de recursos protegidos', () => {
  it('comparte una renovación entre solicitudes concurrentes y reintenta sólo el 401', async () => {
    let isRefreshed = false;
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const fetcher = vi.fn<typeof fetch>(async (url) => {
      if (url === '/api/auth/refresh') {
        await pending;
        isRefreshed = true;
        return new Response('OK');
      }
      return Response.json(isRefreshed ? { data: [] } : { code: 'INVALID_AUTH' }, {
        status: isRefreshed ? 200 : 401,
      });
    });
    const { request } = createApiClient(fetcher);
    const requests = [request('/materials'), request('/wastes')];
    await vi.waitFor(() =>
      expect(fetcher.mock.calls.filter(([url]) => url === '/api/auth/refresh')).toHaveLength(1),
    );
    finish();
    await expect(Promise.all(requests)).resolves.toEqual([{ data: [] }, { data: [] }]);
    expect(fetcher.mock.calls.filter(([url]) => url === '/materials')).toHaveLength(2);
  });

  it.each([403, 409, 500])(
    'no renueva ni repite una escritura rechazada con %s',
    async (status) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json({ code: 'UNKNOWN' }, { status }));
      await expect(
        createApiClient(fetcher).request('/stock', { method: 'PATCH' }),
      ).rejects.toMatchObject({ status });
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );

  it('conserva el rechazo de sesión si también falla la renovación', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => Response.json({ code: 'INVALID_AUTH' }, { status: 401 }));
    await expect(createApiClient(fetcher).request('/materials')).rejects.toMatchObject({
      status: 401,
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('rechaza HTML de un proxy en un listado o una descarga Excel', async () => {
    const { request } = createApiClient(
      vi
        .fn<typeof fetch>()
        .mockImplementation(
          async () =>
            new Response('<html>Login</html>', { headers: { 'content-type': 'text/html' } }),
        ),
    );
    await expect(request('/materials')).rejects.toBeInstanceOf(ApiError);
    await expect(request('/report', {}, true)).rejects.toBeInstanceOf(ApiError);
  });
});
