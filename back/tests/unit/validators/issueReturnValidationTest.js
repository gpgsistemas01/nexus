import { describe, expect, it } from 'vitest';
import { validationResult } from 'express-validator';

import { issueReturnValidation } from '../../../src/validators/forms/issueReturnValidations.js';

const validate = async body => {
    const req = { body, params: {
        id: '11111111-1111-4111-8111-111111111111',
        detailId: '22222222-2222-4222-8222-222222222222'
    } };

    await Promise.all(issueReturnValidation.map(rule => rule.run(req)));

    return validationResult(req).array();
};

describe('issueReturnValidation', () => {
    it('acepta una cantidad positiva y observaciones opcionales', async () => {
        const errors = await validate({ returnQuantity: '1.25', observations: 'Devolución parcial' });

        expect(errors).toEqual([]);
    });

    it.each([
        [{ returnQuantity: 0 }, 'returnQuantity'],
        [{ returnQuantity: -1 }, 'returnQuantity'],
        [{ returnQuantity: 1, observations: 'a'.repeat(501) }, 'observations']
    ])('rechaza una devolución inválida', async (body, field) => {
        const errors = await validate(body);

        expect(errors.some(error => error.path === field)).toBe(true);
    });
});
