import { describe, expect, it } from 'vitest';

import { validateTestDatabaseEnv } from '../../scripts/verifyTestDatabaseEnv.js';

describe('verifyTestDatabaseEnv', () => {
  it('permite ejecutar pruebas de BD con una base de pruebas aislada', () => {
    expect(() => validateTestDatabaseEnv({
      databaseUrl: 'postgresql://user:pass@localhost:5432/sistema_merma',
      databaseTestUrl: 'postgresql://user:pass@localhost:5432/sistema_merma_test'
    })).not.toThrow();
  });

  it('falla si falta DATABASE_TEST_URL', () => {
    expect(() => validateTestDatabaseEnv({
      databaseUrl: 'postgresql://user:pass@localhost:5432/sistema_merma',
      databaseTestUrl: ''
    })).toThrow(/DATABASE_TEST_URL/);
  });

  it('falla si DATABASE_TEST_URL apunta a la misma base que DATABASE_URL', () => {
    expect(() => validateTestDatabaseEnv({
      databaseUrl: 'postgresql://user:pass@localhost:5432/sistema_merma/',
      databaseTestUrl: 'postgresql://user:pass@localhost:5432/sistema_merma'
    })).toThrow(/different database/);
  });
});
