import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let rejectResponse;
let api;
let post;
let apiRequest;

describe('normalización y renovación del transporte HTTP', () => {
  beforeEach(async () => {
    vi.resetModules();
    api = vi.fn().mockResolvedValue({ data: { id: 'current-record' } });
    api.interceptors = { response: { use: (_success, reject) => { rejectResponse = reject; } } };
    post = vi.fn();
    vi.stubGlobal('window', { location: { origin: 'http://localhost', replace: vi.fn() } });
    vi.stubGlobal('axios', { create: () => api, post });
    ({ apiRequest } = await import('../../../../../src/public/js/services/axiosInstanceApi.js'));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('conserva un 400 de captura y sus códigos por campo sin renovar sesión', async () => {
    const data = { code: 'VALIDATION_ERROR', errors: { name: { code: 'NAME_REQUIRED' } } };

    await expect(rejectResponse({ config: {}, response: { status: 400, data } })).rejects.toMatchObject({ status: 400, data });

    expect(post).not.toHaveBeenCalled();
  });

  it.each(['LOGIN_ERROR', 'PUBLIC_UNAUTHORIZED'])('una petición pública no renueva ni redirige por el código %s', async code => {
    const data = { code };

    await expect(rejectResponse({ config: { requiresAuth: false }, response: { status: 401, data } }))
      .rejects.toMatchObject({ status: 401, requiresAuth: false, data });

    expect(post).not.toHaveBeenCalled();
    expect(api).not.toHaveBeenCalled();
  });

  it('el servicio de login declara la petición pública sin cambiar los datos de captura', async () => {
    const { loginRequest } = await import('../../../../../src/public/js/services/authService.js');
    const data = { name: 'account', password: 'example' };

    await loginRequest({ data });

    expect(api).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      method: 'post', url: '/api/auth/login', data, requiresAuth: false
    }));
  });

  it('las demás peticiones requieren sesión por defecto', async () => {
    await apiRequest({ method: 'get', url: '/api/admin/persons' });

    expect(api).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ requiresAuth: true }));
  });

  it('comparte una renovación entre solicitudes simultáneas y reintenta cada original una vez', async () => {
    let finish;
    post.mockReturnValue(new Promise(resolve => { finish = resolve; }));
    const first = { url: '/api/admin/persons' };
    const second = { url: '/api/admin/users' };

    const pending = [first, second].map(config => rejectResponse({ config, response: { status: 401 } }));
    expect(post).toHaveBeenCalledTimes(1);
    finish({ status: 200 });
    await Promise.all(pending);

    expect(api.mock.calls).toEqual([[{ ...first, _retry: true }], [{ ...second, _retry: true }]]);
  });

  it.each([401, 500])('normaliza el fallo %s del refresh sin notificar ni redirigir desde el transporte', async status => {
    const data = { code: status === 401 ? 'INVALID_AUTH' : 'SERVER_ERROR' };
    post.mockRejectedValue({ response: { status, data } });

    await expect(rejectResponse({ config: {}, response: { status: 401 } })).rejects.toMatchObject({ status, data });

    expect(post).toHaveBeenCalledTimes(1);
    expect(api).not.toHaveBeenCalled();
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it('no inicia otra renovación si la petición ya reintentada conserva el 401', async () => {
    await expect(rejectResponse({ config: { _retry: true }, response: { status: 401 } })).rejects.toMatchObject({ status: 401 });

    expect(post).not.toHaveBeenCalled();
  });
});
