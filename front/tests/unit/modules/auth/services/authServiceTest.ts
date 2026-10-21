import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoginRequestError, loginRequest } from '../../../../../src/modules/auth/services/authService.js';

afterEach(() => vi.unstubAllGlobals());

describe('adaptador HTTP del login', () => {
  it('envía sólo credenciales, recorta usuario y conserva los espacios de contraseña', async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'SUCCESS_LOGIN' }), { status: 200 }));
    vi.stubGlobal('fetch', request);
    await loginRequest({ name: ' usuario ', password: ' legado ' });
    expect(request).toHaveBeenCalledOnce();
    const [url, options] = request.mock.calls[0]!;
    expect(url).toBe('/api/auth/login');
    expect(options.credentials).toBe('same-origin');
    expect(JSON.parse(options.body)).toEqual({ name: 'usuario', password: ' legado ' });
  });

  it('traduce el contrato 400 por campo usando los mensajes públicos existentes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 'VALIDATION_ERROR', errors: { name: { code: 'USERNAME_REQUIRED' }, password: { code: 'PASSWORD_TOO_LONG' } },
    }), { status: 400 })));
    await expect(loginRequest({ name: '', password: 'p' })).rejects.toMatchObject({
      fieldErrors: { name: expect.any(String), password: expect.any(String) },
    });
  });

  it.each([401, 429, 500])('un HTTP %s no se interpreta como acceso válido', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
    await expect(loginRequest({ name: 'usuario', password: 'abc' })).rejects.toBeInstanceOf(LoginRequestError);
  });

  it.each(['<html>Frontend en lugar de API</html>', '{"ok":true}'])('rechaza una respuesta inesperada aunque tenga HTTP 200', async body => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 200 })));
    await expect(loginRequest({ name: 'usuario', password: 'abc' })).rejects.toBeInstanceOf(LoginRequestError);
  });

  it('presenta un fallo de conexión sin reintentar el acceso ni renovar tokens', async () => {
    const request = vi.fn().mockRejectedValue(new TypeError('Network error'));
    vi.stubGlobal('fetch', request);
    await expect(loginRequest({ name: 'usuario', password: 'abc' })).rejects.toThrow('No fue posible conectar');
    expect(request).toHaveBeenCalledOnce();
  });

  it.each([
    [401, 'Usuario o contraseña incorrectos.'],
    [429, 'Demasiados intentos. Espera un momento e intenta nuevamente.'],
  ])('conserva el significado de HTTP %s aunque un proxy devuelva HTML', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<h1>Gateway</h1>', { status })));

    await expect(loginRequest({ name: 'usuario', password: 'legado' })).rejects.toThrow(message);
  });

  it('no muestra códigos desconocidos como mensajes de campo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 'VALIDATION_ERROR', errors: { name: { code: 'UNKNOWN_INTERNAL_CODE' } },
    }), { status: 400 })));

    await expect(loginRequest({ name: 'usuario', password: 'legado' })).rejects.toMatchObject({
      message: 'Revisa los datos de acceso.', fieldErrors: {},
    });
  });
});
