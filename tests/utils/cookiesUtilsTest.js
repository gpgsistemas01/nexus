import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearAccessCookie,
  clearAuthCookies,
  clearRefreshCookie,
  setAuthCookies
} from '../../src/utils/cookiesUtils.js';

const createResponse = () => ({
  cookie: vi.fn(),
  clearCookie: vi.fn()
});

const authCookieSetCases = [
  { nodeEnv: 'production', secure: true },
  { nodeEnv: 'development', secure: false }
];

describe('cookiesUtils', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(authCookieSetCases)('configura cookies de autenticación con secure=$secure cuando NODE_ENV=$nodeEnv', ({ nodeEnv, secure }) => {
    vi.stubEnv('NODE_ENV', nodeEnv);
    const res = createResponse();

    setAuthCookies(res, 'access-token', 'refresh-token');

    expect(res.cookie).toHaveBeenNthCalledWith(1, 'accessToken', 'access-token', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000
    });
    expect(res.cookie).toHaveBeenNthCalledWith(2, 'refreshToken', 'refresh-token', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  });

  it('limpia las cookies de autenticación con opciones consistentes al entorno', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const res = createResponse();

    clearAccessCookie(res);
    clearRefreshCookie(res);

    expect(res.clearCookie).toHaveBeenNthCalledWith(1, 'accessToken', { sameSite: 'lax', secure: true });
    expect(res.clearCookie).toHaveBeenNthCalledWith(2, 'refreshToken', { sameSite: 'lax', secure: true });
  });

  it('limpia ambas cookies de autenticación reutilizando las opciones por entorno', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const res = createResponse();

    clearAuthCookies(res);

    expect(res.clearCookie).toHaveBeenNthCalledWith(1, 'accessToken', { sameSite: 'lax', secure: false });
    expect(res.clearCookie).toHaveBeenNthCalledWith(2, 'refreshToken', { sameSite: 'lax', secure: false });
  });
});
