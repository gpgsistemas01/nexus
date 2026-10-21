import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearAuthCookies, setAuthCookies } from '../../../src/utils/cookiesUtils.js';

afterEach(() => vi.unstubAllEnvs());

const createCookieApp = () => {
  const app = express();

  app.get('/login', (_req, res) => {
    setAuthCookies(res, 'access-test', 'refresh-test');
    res.sendStatus(200);
  });
  app.post('/logout', (_req, res) => {
    clearAuthCookies(res);
    res.sendStatus(200);
  });

  return app;
};

describe('cookies de autenticación por entorno', () => {
  it.each([
    ['production', true],
    ['development', false],
    ['test', false]
  ])('emite ambas cookies con protección HTTPS coherente en %s', async (environment, requiresHttps) => {
    vi.stubEnv('NODE_ENV', environment);

    const response = await request(createCookieApp()).get('/login');

    const cookies = response.headers['set-cookie'];
    expect(cookies).toHaveLength(2);
    expect(cookies.some(cookie => cookie.startsWith('accessToken='))).toBe(true);
    expect(cookies.some(cookie => cookie.startsWith('refreshToken='))).toBe(true);
    for (const cookie of cookies) {
      expect(cookie).toContain('; HttpOnly');
      expect(cookie).toContain('; SameSite=Lax');
      expect(cookie.includes('; Secure')).toBe(requiresHttps);
    }
  });

  it('el cierre de sesión conserva Secure y SameSite al expirar ambas cookies en producción', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const response = await request(createCookieApp()).post('/logout');

    const cookies = response.headers['set-cookie'];
    expect(cookies).toHaveLength(2);
    for (const cookie of cookies) {
      expect(cookie).toContain('; Secure');
      expect(cookie).toContain('; SameSite=Lax');
      expect(cookie).toContain('Expires=Thu, 01 Jan 1970');
    }
  });
});
