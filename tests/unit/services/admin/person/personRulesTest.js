import { describe, expect, it } from 'vitest';
import { INTERNAL_CLIENT_NAME } from '../../../../../src/constants/issueHeaderRules.js';
import { ROLE_KEYS } from '../../../../../src/constants/roles.js';
import { isValidInternalClientAdvisor } from '../../../../../src/services/admin/person/personRules.js';

describe('reglas de asesor de cliente interno', () => {
    it('reconoce coordinación por clave aunque cambie la etiqueta del rol', () => {
        expect(isValidInternalClientAdvisor({
            client: { name: INTERNAL_CLIENT_NAME },
            advisor: { accesses: [{ role: { key: ROLE_KEYS.COORDINATOR, name: 'Etiqueta actualizada' } }] }
        })).toBe(true);
    });

    it('requiere clave de coordinación para el cliente interno', () => {
        expect(isValidInternalClientAdvisor({
            client: { name: INTERNAL_CLIENT_NAME },
            advisor: { accesses: [{ role: { key: ROLE_KEYS.OPERATOR, name: 'Coordinador' } }] }
        })).toBe(false);
    });

    it('no aplica la restricción de asesor al cliente externo', () => {
        expect(isValidInternalClientAdvisor({
            client: { name: 'Cliente externo' },
            advisor: { accesses: [{ role: { key: ROLE_KEYS.OPERATOR } }] }
        })).toBe(true);
    });
});
