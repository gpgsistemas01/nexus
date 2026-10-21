import { describe, expect, it } from 'vitest';
import { validationResult } from 'express-validator';
import { loginValidation } from '../../../src/validators/forms/authValidations.js';
import { validatePassword } from '../../../src/validators/fields/fieldsValidator.js';
import { loginValidation as frontendLoginValidation } from '../../../src/public/js/utils/validations/loginValidation.js';
import { userValidation } from '../../../src/public/js/utils/validations/validators.js';
import { validateFields } from '../../../src/public/js/utils/formUtils.js';

describe('contrato de captura de login distinto de la política de altas (DP-VAL-002)', () => {
    it.each([
        ['usuario en minúsculas', { name: 'usuario', password: 'legado' }, []],
        ['credencial histórica corta', { name: 'usuario', password: 'abc' }, []],
        ['contraseña con espacios conservados', { name: 'usuario', password: ' legado ' }, []],
        ['límites máximos', { name: 'u'.repeat(50), password: 'p'.repeat(50) }, []],
        ['nombre ausente', { password: 'legado' }, ['name']],
        ['nombre vacío', { name: '   ', password: 'legado' }, ['name']],
        ['nombre no textual', { name: 123, password: 'legado' }, ['name']],
        ['nombre demasiado largo', { name: 'u'.repeat(51), password: 'legado' }, ['name']],
        ['contraseña ausente', { name: 'usuario' }, ['password']],
        ['contraseña vacía', { name: 'usuario', password: '   ' }, ['password']],
        ['contraseña no textual', { name: 'usuario', password: {} }, ['password']],
        ['contraseña demasiado larga', { name: 'usuario', password: 'p'.repeat(51) }, ['password']]
    ])('frontend y backend coinciden para %s', async (_case, data, invalidFields) => {
        const req = { body: { ...data } };
        for (const rule of loginValidation) await rule.run(req);
        const backendErrors = validationResult(req).array();
        const frontendErrors = validateFields(frontendLoginValidation, data);

        expect([...new Set(backendErrors.map(error => error.path))]).toEqual(invalidFields);
        expect(Object.keys(frontendErrors).filter(field => frontendErrors[field])).toEqual(invalidFields);
        expect(backendErrors.every(error => typeof error.msg === 'string' && /^(USERNAME|PASSWORD)_/.test(error.msg))).toBe(true);
        expect(req.body.password).toEqual(data.password);
    });

    it('la creación conserva sus requisitos de contraseña y acepta el mismo usuario sin mayúsculas', async () => {
        const req = { body: { password: 'legado' } };
        await validatePassword.run(req);

        expect(validationResult(req).array().map(error => error.msg)).toContain('PASSWORD_NEEDS_UPPERCASE');
        expect(userValidation.password('legado')).toBeTruthy();
        expect(userValidation.password('Valida1')).toBeNull();
        expect(userValidation.name('usuario')).toBeNull();
    });
});
