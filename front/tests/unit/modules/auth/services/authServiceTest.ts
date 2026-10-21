import { afterEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import { apiClient } from '../../../../../src/shared/http/apiClient.js';
import {
  LoginRequestError,
  loginRequest,
} from '../../../../../src/modules/auth/services/authService.js';
import { mockHttpAdapter } from '../../../../helpers/httpAdapter.js';

const originalAdapter = apiClient.http.defaults.adapter;
afterEach(() => {
  apiClient.http.defaults.adapter = originalAdapter;
});
const reply = (data: unknown, status = 200) => {
  const request = vi.fn(() => ({ data, status }));
  apiClient.http.defaults.adapter = mockHttpAdapter(request);
  return request;
};

describe('adaptador Axios del login público', () => {
  it('envía sólo credenciales, recorta usuario y conserva los espacios de contraseña', async () => {
    const request = vi.fn((config) => ({ data: { code: 'SUCCESS_LOGIN' }, sent: config }));
    apiClient.http.defaults.adapter = mockHttpAdapter(request);
    await loginRequest({ name: ' usuario ', password: ' legado ' });
    expect(request).toHaveBeenCalledOnce();
    const config = request.mock.calls[0]![0];
    expect(config.url).toBe('/api/auth/login');
    expect(JSON.parse(config.data)).toEqual({ name: 'usuario', password: ' legado ' });
    expect(config.headers.has('Authorization')).toBe(false);
  });

  it('traduce el contrato 400 por campo usando los mensajes públicos existentes', async () => {
    reply(
      {
        code: 'VALIDATION_ERROR',
        errors: { name: { code: 'USERNAME_REQUIRED' }, password: { code: 'PASSWORD_TOO_LONG' } },
      },
      400,
    );
    await expect(loginRequest({ name: '', password: 'p' })).rejects.toMatchObject({
      fieldErrors: { name: expect.any(String), password: expect.any(String) },
    });
  });

  it.each([401, 429, 500])('HTTP %s no confirma el acceso ni renueva tokens', async (status) => {
    const request = reply({}, status);
    await expect(loginRequest({ name: 'usuario', password: 'abc' })).rejects.toBeInstanceOf(
      LoginRequestError,
    );
    expect(request).toHaveBeenCalledOnce();
  });

  it.each(['<html>Frontend en lugar de API</html>', { ok: true }])(
    'rechaza una respuesta inesperada aunque tenga HTTP 200',
    async (data) => {
      reply(data);
      await expect(loginRequest({ name: 'usuario', password: 'abc' })).rejects.toBeInstanceOf(
        LoginRequestError,
      );
    },
  );

  it('presenta un fallo de conexión sin reintentar el acceso', async () => {
    const request = vi.fn(() => {
      throw new AxiosError('Network error', 'ERR_NETWORK');
    });
    apiClient.http.defaults.adapter = mockHttpAdapter(request);
    await expect(loginRequest({ name: 'usuario', password: 'abc' })).rejects.toThrow(
      'No fue posible conectar',
    );
    expect(request).toHaveBeenCalledOnce();
  });

  it.each([
    [401, 'Usuario o contraseña incorrectos.'],
    [429, 'Demasiados intentos. Espera un momento e intenta nuevamente.'],
  ] as const)('conserva HTTP %s aunque el proxy devuelva HTML', async (status, message) => {
    reply('<h1>Gateway</h1>', status);
    await expect(loginRequest({ name: 'usuario', password: 'legado' })).rejects.toThrow(message);
  });

  it('no muestra códigos desconocidos como mensajes de campo', async () => {
    reply({ code: 'VALIDATION_ERROR', errors: { name: { code: 'UNKNOWN_INTERNAL_CODE' } } }, 400);
    await expect(loginRequest({ name: 'usuario', password: 'legado' })).rejects.toMatchObject({
      message: 'Revisa los datos de acceso.',
      fieldErrors: {},
    });
  });
});
