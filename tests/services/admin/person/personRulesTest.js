import { describe, expect, it } from 'vitest';

import { isValidInternalClientAdvisor } from '../../../../src/services/admin/person/personRules.js';

describe('personRules', () => {
  it('acepta un asesor interno con acceso de coordinador', () => {
    expect(isValidInternalClientAdvisor({
      client: { name: 'GPG INTERNO' },
      advisor: { accesses: [{ role: { name: 'Coordinador' } }] }
    })).toBe(true);
  });

  it('rechaza un asesor interno sin acceso de coordinador', () => {
    const client = { name: 'GPG INTERNO' };

    expect(isValidInternalClientAdvisor({
      client,
      advisor: { accesses: [{ role: { name: 'Operador' } }] }
    })).toBe(false);
    expect(isValidInternalClientAdvisor({ client, advisor: null })).toBe(false);
  });

  it('no aplica la restricción de coordinador a clientes externos', () => {
    expect(isValidInternalClientAdvisor({
      client: { name: 'Cliente externo' },
      advisor: { accesses: [{ role: { name: 'Operador' } }] }
    })).toBe(true);
  });
});
