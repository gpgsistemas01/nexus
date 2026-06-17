import { describe, expect, it, vi } from 'vitest';

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

describe('cookiesUtils', () => {
  it('configura cookies de autenticación seguras para access y refresh token', () => {
    const res = createResponse();

    setAuthCookies(res, 'access-token', 'refresh-token');

    expect(res.cookie).toHaveBeenNthCalledWith(1, 'accessToken', 'access-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000
    });
    expect(res.cookie).toHaveBeenNthCalledWith(2, 'refreshToken', 'refresh-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  });

  it('limpia la cookie de access token con opciones consistentes', () => {
    const res = createResponse();

    clearAccessCookie(res);

    expect(res.clearCookie).toHaveBeenCalledWith('accessToken', { sameSite: 'lax', secure: true });
  });

  it('limpia la cookie de refresh token con opciones consistentes', () => {
    const res = createResponse();

    clearRefreshCookie(res);

    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', { sameSite: 'lax', secure: true });
  });

  it('limpia ambas cookies de autenticación', () => {
    const res = createResponse();

    clearAuthCookies(res);

    expect(res.clearCookie).toHaveBeenNthCalledWith(1, 'accessToken', { sameSite: 'lax', secure: true });
    expect(res.clearCookie).toHaveBeenNthCalledWith(2, 'refreshToken', { sameSite: 'lax', secure: true });
  });
});
