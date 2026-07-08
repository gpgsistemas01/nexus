import { afterEach, describe, expect, it, vi } from 'vitest';

import { getDatabaseUrl, resolveDatabaseUrl } from '../../src/lib/databaseUrl.js';

describe('databaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('usa DATABASE_TEST_URL cuando NODE_ENV es test', () => {
    expect(resolveDatabaseUrl({
      nodeEnv: 'test',
      databaseUrl: 'postgresql://app-db',
      testDatabaseUrl: 'postgresql://test-db'
    })).toBe('postgresql://test-db');
  });

  it('usa DATABASE_URL cuando NODE_ENV no es test', () => {
    expect(resolveDatabaseUrl({
      nodeEnv: 'production',
      databaseUrl: 'postgresql://app-db',
      testDatabaseUrl: 'postgresql://test-db'
    })).toBe('postgresql://app-db');
  });

  it('prioriza DIRECT_URL cuando se solicita una conexión directa fuera de pruebas', () => {
    expect(resolveDatabaseUrl({
      nodeEnv: 'production',
      databaseUrl: 'postgresql://pooler-db',
      directUrl: 'postgresql://direct-db',
      preferDirectUrl: true
    })).toBe('postgresql://direct-db');
  });

  it('mantiene DATABASE_TEST_URL en pruebas aunque se solicite DIRECT_URL', () => {
    expect(resolveDatabaseUrl({
      nodeEnv: 'test',
      databaseUrl: 'postgresql://pooler-db',
      testDatabaseUrl: 'postgresql://test-db',
      directUrl: 'postgresql://direct-db',
      preferDirectUrl: true
    })).toBe('postgresql://test-db');
  });

  it('lee DATABASE_TEST_URL desde process.env en pruebas', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('DATABASE_URL', 'postgresql://env-app-db');
    vi.stubEnv('DATABASE_TEST_URL', 'postgresql://env-test-db');

    expect(getDatabaseUrl()).toBe('postgresql://env-test-db');
  });

  it('lee DATABASE_URL desde process.env fuera de pruebas', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', 'postgresql://env-app-db');
    vi.stubEnv('DATABASE_TEST_URL', 'postgresql://env-test-db');

    expect(getDatabaseUrl()).toBe('postgresql://env-app-db');
  });

  it('falla explícitamente con NODE_ENV cuando no hay URL configurada', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('DATABASE_TEST_URL', '');

    expect(() => getDatabaseUrl()).toThrow(/DATABASE_URL no está definida\. NODE_ENV=test/);
  });
});
