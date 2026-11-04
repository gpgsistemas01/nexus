import { expect, it, vi } from 'vitest';
import { authenticateManualAccount } from '../../../scripts/manual/authentication.mjs';

const credentials = { name: 'fixture-user', password: ' fixture-password ' };
const requestWithStatus = (status: number, data: unknown = { code: 'SUCCESS_LOGIN' }) => ({
  post: vi.fn(async () => ({
    status: () => status,
    ok: () => status >= 200 && status < 300,
    json: async () => data,
  })),
});

it('confirma el contrato del login sin redirecciones ni recortar la contraseña', async () => {
  const request = requestWithStatus(200);
  await expect(
    authenticateManualAccount(request, 'cuenta-01', credentials),
  ).resolves.toBeUndefined();
  expect(request.post).toHaveBeenCalledExactlyOnceWith('/api/auth/login', {
    data: credentials,
    maxRedirects: 0,
    timeout: 15_000,
  });
});

it.each([
  [400, 'formato'],
  [401, 'incorrectos'],
  [403, 'rechazó el acceso'],
  [302, 'baseUrl'],
  [404, 'baseUrl'],
  [429, 'límite de intentos'],
  [500, 'log de la API'],
  [502, 'API o el proxy'],
  [503, 'API o el proxy'],
  [504, 'API o el proxy'],
] as const)('HTTP %s conserva el diagnóstico sin publicar credenciales', async (status, hint) => {
  const request = requestWithStatus(status, credentials);
  const result = await authenticateManualAccount(request, 'cuenta-01', credentials).catch(
    (cause: Error) => cause,
  );
  if (!(result instanceof Error)) throw new Error('El login debía ser rechazado.');
  expect(result.message).toContain(`cuenta-01: HTTP ${status}`);
  expect(result.message).toContain(hint);
  expect(result.message).not.toContain(credentials.name);
  expect(result.message).not.toContain(credentials.password);
  expect(request.post).toHaveBeenCalledOnce();
});

it('informa el código de conexión y descarta los datos privados del error original', async () => {
  const request = {
    post: vi.fn(async () => {
      throw new Error(`ECONNRESET cookie=private ${credentials.name} ${credentials.password}`);
    }),
  };
  const result = await authenticateManualAccount(request, 'cuenta-01', credentials).catch(
    (cause: Error) => cause,
  );
  if (!(result instanceof Error)) throw new Error('El login debía fallar por conexión.');
  expect(result.message).toContain('cuenta-01: ECONNRESET');
  expect(result.message).not.toContain('cookie=');
  expect(result.message).not.toContain(credentials.name);
  expect(result.message).not.toContain(credentials.password);
  expect(result.cause).toBeUndefined();
  expect(request.post).toHaveBeenCalledOnce();
});

it.each([null, { ok: true }, { code: 'OTRO_RESULTADO' }])(
  'HTTP 200 con cuerpo %j no acredita el acceso para las capturas',
  async (body) => {
    await expect(
      authenticateManualAccount(requestWithStatus(200, body), 'cuenta-01', credentials),
    ).rejects.toThrow('respuesta de login no válida');
  },
);

it('una página HTML en el origen configurado no se acepta como API de login', async () => {
  const request = {
    post: vi.fn(async () => ({
      status: () => 200,
      ok: () => true,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    })),
  };
  await expect(authenticateManualAccount(request, 'cuenta-01', credentials)).rejects.toThrow(
    'baseUrl',
  );
});
