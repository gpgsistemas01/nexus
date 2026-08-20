import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosMocks = vi.hoisted(() => {
  const responseUse = vi.fn();
  const api = vi.fn();

  api.interceptors = {
    response: { use: responseUse }
  };

  return {
    api,
    axios: {
      create: vi.fn(() => api),
      post: vi.fn()
    },
    responseUse
  };
});

vi.stubGlobal('window', {
  location: {
    origin: 'http://localhost',
    href: '/warehouse'
  }
});
vi.stubGlobal('axios', axiosMocks.axios);

await import('../../../../../src/public/js/services/axiosInstanceApi.js');

const getResponseErrorInterceptor = () => axiosMocks.responseUse.mock.calls[0][1];

beforeEach(() => {
  axiosMocks.api.mockReset();
  axiosMocks.axios.post.mockReset();
  window.location.href = '/warehouse';
});

describe('renovación de autenticación del transporte HTTP compartido', () => {
  it('permite renovar nuevamente la sesión en solicitudes posteriores de un select', async () => {
    const handleResponseError = getResponseErrorInterceptor();

    axiosMocks.axios.post.mockResolvedValue({ status: 200 });
    axiosMocks.api.mockResolvedValue({ data: { data: [] } });

    await handleResponseError({ response: { status: 401 }, config: { url: '/api/first-select' } });
    await handleResponseError({ response: { status: 401 }, config: { url: '/api/second-select' } });

    expect(axiosMocks.axios.post).toHaveBeenCalledTimes(2);
    expect(axiosMocks.api).toHaveBeenCalledTimes(2);
  });

  it('comparte una renovación concurrente y reintenta cada solicitud original', async () => {
    const handleResponseError = getResponseErrorInterceptor();
    let resolveRefresh;
    const refreshResponse = new Promise(resolve => {
      resolveRefresh = resolve;
    });

    axiosMocks.axios.post.mockReturnValue(refreshResponse);
    axiosMocks.api.mockResolvedValue({ data: { data: [] } });

    const requests = [
      handleResponseError({ response: { status: 401 }, config: { url: '/api/materials' } }),
      handleResponseError({ response: { status: 401 }, config: { url: '/api/suppliers' } })
    ];

    resolveRefresh({ status: 200 });
    await Promise.all(requests);

    expect(axiosMocks.axios.post).toHaveBeenCalledTimes(1);
    expect(axiosMocks.api).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/materials', _retry: true }));
    expect(axiosMocks.api).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/suppliers', _retry: true }));
  });
});
