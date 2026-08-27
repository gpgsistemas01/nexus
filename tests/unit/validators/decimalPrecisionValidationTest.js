import { describe, expect, it } from 'vitest';
import { validationResult } from 'express-validator';

import { validatePositiveNumber } from '../../../src/validators/fields/fieldsValidator.js';

const validate = async value => {
    const req = { body: { quantity: value } };
    await validatePositiveNumber('quantity').run(req);
    return validationResult(req).array();
};

describe('validatePositiveNumber decimal precision', () => {
    it('acepta el límite persistente de seis decimales en creación o edición', async () => {
        expect(await validate('99999999.999999')).toEqual([]);
    });

    it.each(['1.1234567', '100000000.1'])('rechaza un valor fuera de precisión: %s', async value => {
        expect(await validate(value)).not.toEqual([]);
    });
});
