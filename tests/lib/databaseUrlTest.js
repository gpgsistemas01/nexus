import { afterEach, describe, expect, it, vi } from 'vitest';

import { getDatabaseUrl, resolveDatabaseUrl } from '../../src/lib/databaseUrl.js';

describe('databaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it('usa únicamente DATABASE_TEST_URL durante pruebas automatizadas', () => {
    expect(resolveDatabaseUrl({
      nodeEnv: 'test',
      databaseUrl: 'postgresql://app-db',
      databaseTestUrl: 'postgresql://test-db',
      databaseUrlDirect: 'postgresql://direct-db',
      directUrl: 'postgresql://legacy-direct-db'
    })).toBe('postgresql://test-db');
  });

  it('no usa variables de producción como fallback cuando NODE_ENV es test', () => {
    expect(resolveDatabaseUrl({
      nodeEnv: 'test',
      databaseUrl: 'postgresql://app-db',
      databaseUrlDirect: 'postgresql://direct-db',
      directUrl: 'postgresql://legacy-direct-db'
    })).toBeUndefined();
  });

  it('mantiene DATABASE_URL como primera opción fuera de pruebas', () => {
    expect(resolveDatabaseUrl({
      nodeEnv: 'production',
      databaseUrl: 'postgresql://app-db',
      databaseTestUrl: 'postgresql://test-db',
      databaseUrlDirect: 'postgresql://direct-db'
    })).toBe('postgresql://app-db');
  });

  it('permite usar DATABASE_URL_DIRECT y DIRECT_URL como compatibilidad fuera de pruebas', () => {
    expect(resolveDatabaseUrl({
      nodeEnv: 'production',
      databaseUrlDirect: 'postgresql://legacy-direct-db',
      directUrl: 'postgresql://direct-db'
    })).toBe('postgresql://legacy-direct-db');
  });

  it('no usa DATABASE_TEST_URL fuera de pruebas', () => {
    expect(resolveDatabaseUrl({
      nodeEnv: 'production',
      databaseTestUrl: 'postgresql://test-db'
    })).toBeUndefined();
  });

  it('lee DATABASE_TEST_URL desde variables de entorno reales cuando NODE_ENV es test', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('DATABASE_URL', 'postgresql://app-db');
    vi.stubEnv('DATABASE_TEST_URL', 'postgresql://env-test-db');
    vi.stubEnv('DATABASE_URL_DIRECT', 'postgresql://direct-db');
    vi.stubEnv('DIRECT_URL', 'postgresql://legacy-direct-db');

    expect(getDatabaseUrl()).toBe('postgresql://env-test-db');
  });

  it('lee DATABASE_URL desde variables de entorno reales fuera de pruebas', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', 'postgresql://env-app-db');
    vi.stubEnv('DATABASE_TEST_URL', 'postgresql://env-test-db');

    expect(getDatabaseUrl()).toBe('postgresql://env-app-db');
  });

  it('falla explícitamente con DATABASE_TEST_URL si process.env no tiene URL de pruebas configurada', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('DATABASE_URL', 'postgresql://app-db');
    vi.stubEnv('DATABASE_TEST_URL', '');
    vi.stubEnv('DATABASE_URL_DIRECT', 'postgresql://direct-db');
    vi.stubEnv('DIRECT_URL', 'postgresql://legacy-direct-db');

    expect(() => getDatabaseUrl()).toThrow(/DATABASE_TEST_URL/);
  });
});
