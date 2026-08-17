import { describe, expect, it } from 'vitest';
import { validationResult } from 'express-validator';

import {
    validateBoolean,
    validateDate,
    validateNumber,
    validateText,
    validateUUID
} from '../../../src/validators/fields/fieldsValidator.js';
import { clientValidation } from '../../../src/validators/forms/clientValidations.js';

const runValidation = async (rules, requestBody) => {
    const req = { body: requestBody };

    await Promise.all(rules.map(rule => rule.run(req)));

    return validationResult(req).array();
};

const requiredFieldCases = [
    ['texto', [validateText({ fieldName: 'name', maxLength: 255 })], 'name', 'NAME_REQUIRED'],
    ['UUID', [validateUUID('supplierId')], 'supplierId', 'SUPPLIER_ID_REQUIRED'],
    ['booleano', [validateBoolean('isActive')], 'isActive', 'ACTIVE_REQUIRED'],
    ['número', [validateNumber('newStock')], 'newStock', 'NEW_STOCK_REQUIRED'],
    ['fecha', [validateDate('requestDate')], 'requestDate', 'REQUEST_DATE_REQUIRED']
];

describe('validaciones de campos obligatorios', () => {
    it.each(requiredFieldCases)('partición de equivalencia: rechaza la ausencia del campo de tipo %s con su código requerido', async (_type, rules, field, code) => {
        const errors = await runValidation(rules, {});

        expect(errors).toEqual([
            expect.objectContaining({ path: field, msg: code })
        ]);
    });

    it.each(requiredFieldCases)('valor límite: rechaza el valor nulo del campo de tipo %s con su código requerido', async (_type, rules, field, code) => {
        const errors = await runValidation(rules, { [field]: null });

        expect(errors).toEqual([
            expect.objectContaining({ path: field, msg: code })
        ]);
    });

    it.each([
        ['UUID', [validateUUID('supplierId')], 'supplierId', 'no-es-uuid', 'SUPPLIER_ID_INVALID_UUID'],
        ['booleano', [validateBoolean('isActive')], 'isActive', 'no-es-booleano', 'ACTIVE_INVALID_BOOLEAN'],
        ['número', [validateNumber('newStock')], 'newStock', 'no-es-numero', 'NEW_STOCK_INVALID_NUMBER'],
        ['fecha', [validateDate('requestDate')], 'requestDate', 'no-es-fecha', 'REQUEST_DATE_INVALID_FORMAT']
    ])('partición de equivalencia: usa el código inválido y no required para un valor %s presente', async (_type, rules, field, value, code) => {
        const errors = await runValidation(rules, { [field]: value });

        expect(errors[0]).toEqual(expect.objectContaining({ path: field, msg: code }));
        expect(errors).not.toContainEqual(expect.objectContaining({ msg: expect.stringContaining('REQUIRED') }));
    });

    it.each([
        [undefined, 'campo ausente'],
        ['', 'valor vacío'],
        ['   ', 'valor compuesto sólo por espacios']
    ])('CRUD de clientes: rechaza el nombre requerido cuando recibe %s (%s)', async (name) => {
        const requestBody = name === undefined ? {} : { name };
        const errors = await runValidation(clientValidation, requestBody);

        expect(errors).toEqual([
            expect.objectContaining({ path: 'name', msg: 'NAME_REQUIRED' })
        ]);
    });

    it('CRUD de clientes: conserva el campo y acepta un valor válido', async () => {
        const requestBody = { name: 'Cliente válido' };

        await expect(runValidation(clientValidation, requestBody)).resolves.toEqual([]);
        expect(requestBody.name).toBe('Cliente válido');
    });
});
