import { describe, expect, it, vi } from 'vitest';
import { validationResult } from 'express-validator';

import { errorMap } from '../../../src/messages/codeMessages.js';
import { validate } from '../../../src/middleware/validatorMiddleware.js';
import { validateWeightCapture } from '../../../src/validators/fields/fieldsValidator.js';

const runValidation = async (body, options = {}) => {
    const req = { body };
    await validateWeightCapture(options).run(req);
    return req;
};

describe('validateWeightCapture: códigos de error y reglas compartidas', () => {
    it.each([
        ['coneWeightKg', -1, { totalWeightKg: 2 }, errorMap.coneWeightKg.INVALID_NUMBER],
        ['coneWeightKg', '', { totalWeightKg: 2 }, errorMap.coneWeightKg.REQUIRED],
        ['totalWeightKg', '', { coneWeightKg: 0 }, errorMap.totalWeightKg.REQUIRED],
        ['totalWeightKg', 0, { coneWeightKg: 0 }, errorMap.weightKg.INVALID_NUMBER],
        ['totalWeightKg', true, {}, errorMap.weightKg.INVALID_NUMBER],
        ['totalWeightKg', [1], {}, errorMap.weightKg.INVALID_NUMBER],
        ['totalWeightKg', { value: 1 }, {}, errorMap.weightKg.INVALID_NUMBER],
        ['totalWeightKg', '1e2', {}, errorMap.weightKg.INVALID_NUMBER],
        ['totalWeightKg', '1\n', {}, errorMap.weightKg.INVALID_NUMBER],
        ['totalWeightKg', ' 1', {}, errorMap.weightKg.INVALID_NUMBER],
        ['totalWeightKg', 1000, {}, errorMap.weightKg.TOO_HIGH],
        ['totalWeightKg', '999.991', {}, errorMap.weightKg.TOO_HIGH],
        ['totalWeightKg', '0.001', {}, errorMap.weightKg.TOO_LONG],
        ['totalWeightKg', '0001', {}, errorMap.weightKg.TOO_LONG],
        ['totalWeightKg', 2, { coneWeightKg: 2 }, errorMap.totalWeightKg.NOT_GREATER],
        ['totalWeightKg', 1, { coneWeightKg: 2 }, errorMap.totalWeightKg.NOT_GREATER]
    ])('entrega el código registrado para %s=%j', async (fieldName, value, pairedWeights, code) => {
        const req = await runValidation({ ...pairedWeights, [fieldName]: value }, { fieldName });
        expect(validationResult(req).array()).toEqual([
            expect.objectContaining({ path: fieldName, msg: code })
        ]);

        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();
        validate(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            code: errorMap.message.VALIDATION_ERROR,
            errors: { [fieldName]: { code } }
        });
        expect(next).not.toHaveBeenCalled();
    });

    it.each([
        ['coneWeightKg', undefined, {}],
        ['totalWeightKg', '', {}],
        ['coneWeightKg', 0, { totalWeightKg: 1 }],
        ['totalWeightKg', '999.99', { coneWeightKg: 0 }],
        ['totalWeightKg', 1, { coneWeightKg: 'invalid' }]
    ])('acepta %s=%j sin añadir errores secundarios', async (fieldName, value, pairedWeights) => {
        const req = await runValidation({ ...pairedWeights, [fieldName]: value }, { fieldName });
        expect(validationResult(req).array()).toEqual([]);
    });

    it('permite omitir el total cuando la captura se configura como opcional', async () => {
        const req = await runValidation({ referenceConeWeightKg: 0 }, {
            fieldName: 'referenceRollTotalWeightKg', coneFieldName: 'referenceConeWeightKg',
            totalFieldName: 'referenceRollTotalWeightKg', requireTotal: false
        });
        expect(validationResult(req).array()).toEqual([]);
    });
});
