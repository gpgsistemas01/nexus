import { describe, expect, it } from 'vitest';
import { requireSystemTestDatabase } from '../../system/environment.js';

const testUrl = 'postgresql://fixture:fixture@127.0.0.1:5432/nexus_vue_test';
describe('preparación segura de pruebas de sistema', () => {
  it('acepta una base de pruebas explícita y distinta de la base habitual', () => {
    expect(
      requireSystemTestDatabase({
        DATABASE_TEST_URL: testUrl,
        DATABASE_URL: testUrl.replace('nexus_vue_test', 'nexus_unused'),
        DIRECT_TEST_URL: testUrl,
      }),
    ).toBe(testUrl);
  });
  it.each([
    {},
    { DATABASE_TEST_URL: testUrl.replace('nexus_vue_test', 'produccion') },
    { DATABASE_TEST_URL: testUrl, DATABASE_URL: testUrl },
    {
      DATABASE_TEST_URL: testUrl,
      DATABASE_URL: 'postgresql://otro:otro@localhost/nexus_vue_test?schema=otra',
    },
    { DATABASE_TEST_URL: testUrl, DIRECT_TEST_URL: testUrl.replace('nexus_vue_test', 'otra_test') },
    { DATABASE_TEST_URL: 'https://example.com/nexus_vue_test' },
  ])(
    'rechaza configuración insegura antes de iniciar servidores o crear fixtures: %j',
    (environment) => {
      expect(() => requireSystemTestDatabase(environment)).toThrow();
    },
  );
});
