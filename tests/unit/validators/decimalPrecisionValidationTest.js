import { describe, expect, it } from 'vitest';
import { validationResult } from 'express-validator';
import { validateNumber, validateNumberOptional, validatePositiveNumber } from '../../../src/validators/fields/fieldsValidator.js';
import { MONEY_INPUT_FORMAT, MIN_STOCK_INPUT_FORMAT } from '../../../src/public/js/constants/inputValidation.js';

const validate = async (rule, body) => {
    const req = { body: structuredClone(body) };
    await rule.run(req);
    return { errors: validationResult(req).array(), body: req.body };
};

describe('conversión, precisión y frontera cero de la captura numérica (DP-VAL-005)', () => {
    it.each([['0.01', true], ['99999999.99', true], ['0.001', false], ['1.234', false], ['100000000', false]])(
        'cantidad %s respeta dos decimales: válida=%s', async (quantity, valid) => {
            const result = await validate(validatePositiveNumber('quantity'), { quantity });
            expect(result.errors.length === 0).toBe(valid);
            if (valid) expect(result.body.quantity).toBe(Number(quantity));
        }
    );

    it.each([['0.000001', true], ['99999999.999999', true], ['1.1234567', false]])(
        'costo %s conserva hasta seis decimales: válido=%s', async (costPerUnitType, valid) => {
            const result = await validate(validatePositiveNumber('costPerUnitType', { format: MONEY_INPUT_FORMAT }), { costPerUnitType });
            expect(result.errors.length === 0).toBe(valid);
            if (valid) expect(result.body.costPerUnitType).toBe(Number(costPerUnitType));
        }
    );

    it.each(['0', 0, '0.00'])('cero %j es saldo válido y no una cantidad positiva', async value => {
        const stock = await validate(validateNumber('newStock'), { newStock: value });
        expect(stock.errors).toEqual([]);
        expect(stock.body.newStock).toBe(0);
        expect((await validate(validatePositiveNumber('quantity'), { quantity: value })).errors)
            .toContainEqual(expect.objectContaining({ path: 'quantity', msg: 'QUANTITY_INVALID_NUMBER' }));
    });

    it.each([-1, '-0.01'])('un negativo %j se rechaza en ambos casos', async value => {
        expect((await validate(validateNumber('newStock'), { newStock: value })).errors)
            .toContainEqual(expect.objectContaining({ path: 'newStock', msg: 'NEW_STOCK_INVALID_NUMBER' }));
        expect((await validate(validatePositiveNumber('quantity'), { quantity: value })).errors)
            .toContainEqual(expect.objectContaining({ path: 'quantity', msg: 'QUANTITY_INVALID_NUMBER' }));
    });

    it.each([undefined, null, ''])('un stock mínimo ausente %j no se convierte en cero', async minStock => {
        const result = await validate(validateNumberOptional('minStock', { format: MIN_STOCK_INPUT_FORMAT }), { minStock });
        expect(result.errors).toEqual([]);
        expect(result.body.minStock).toBeUndefined();
    });

    it('conserva dos decimales en el límite grande del stock mínimo y rechaza precisión perdida', async () => {
        const rule = () => validateNumberOptional('minStock', { format: MIN_STOCK_INPUT_FORMAT });
        const result = await validate(rule(), { minStock: '999999999999.99' });
        expect(result.errors).toEqual([]);
        expect(result.body.minStock).toBe(999999999999.99);
        expect((await validate(rule(), { minStock: '999999999999.000001' })).errors)
            .toContainEqual(expect.objectContaining({ path: 'minStock', msg: 'MIN_STOCK_TOO_LONG' }));
    });
});
