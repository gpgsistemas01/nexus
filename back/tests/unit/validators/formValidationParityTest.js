import { describe, expect, it } from 'vitest';
import { validationResult } from 'express-validator';
import * as fields from '../../../src/validators/fields/fieldsValidator.js';
import * as front from '../../../src/public/js/utils/validations/validators.js';
import { validateFields, validateDetailsFields, hasValidationErrors } from '../../../src/public/js/utils/formUtils.js';
import { MIN_STOCK_INPUT_FORMAT } from '../../../src/shared/constants/inputValidation.js';
import { personValidation } from '../../../src/validators/forms/personValidations.js';
import { clientValidation } from '../../../src/validators/forms/clientValidations.js';
import { wasteEditValidation } from '../../../src/validators/forms/wasteValidations.js';
import { goodsReceiptValidation } from '../../../src/validators/forms/goodsReceiptValidations.js';

const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const access = { departmentId: id, roleId: otherId };
const run = async (rules, data) => {
    const req = { body: structuredClone(data) };
    for (const rule of rules) await rule.run(req);
    return validationResult(req).array();
};
const agrees = async ({ rules, validator, field, value, valid, data = {} }) => {
    const errors = await run(rules, { ...data, [field]: value });
    const fieldErrors = errors.filter(error => error.path === field || error.path.startsWith(`${field}[`));
    expect(fieldErrors.length === 0).toBe(valid);
    expect(!validator(value)).toBe(valid);
    expect(fieldErrors.every(error => error.msg && error.msg !== 'Invalid value')).toBe(true);
};

describe('captura coherente entre navegador y servidor (DP-VAL-004)', () => {
    it.each([
        ['AB/07-2', true], ["A'O2", true], ['<A-1>', true], ['1'.repeat(10), true],
        ['1'.repeat(11), false], [123, false], [['AB'], false],
        ['A\u0000B', false], ['A\u001BB', false], ['A\nB', false], ['A\tB', false]
    ])('número de proyecto %j conserva texto y rechaza controles: válido=%s', async (value, valid) => {
        await agrees({ rules: [fields.validateProjectNumber('projectNumber')],
            validator: front.issueHeaderValidation.projectNumber, field: 'projectNumber', value, valid });
    });

    it.each([
        [0, true], ['0', true], ['0.01', true], ['99999999.99', true],
        [undefined, false], [null, false], ['', false], [' ', false], [-1, false],
        ['2abc', false], ['1e2', false], [Infinity, false], [true, false], [[2], false], [{}, false],
        ['1.001', false], ['100000000', false]
    ])('stock %j conserva tipo, rango y precisión: válido=%s', async (value, valid) => {
        await agrees({ rules: [fields.validateNumber('newStock')], validator: front.materialStockValidation.newStock,
            field: 'newStock', value, valid });
    });

    it.each([
        [undefined, true], [null, true], ['', true], [0, true], ['999999999999.9', true],
        [-1, false], [[2], false], ['1000000000000', false], ['2.001', false]
    ])('stock mínimo opcional %j respeta la capacidad persistente: válido=%s', async (value, valid) => {
        await agrees({ rules: [fields.validateNumberOptional('minStock', { format: MIN_STOCK_INPUT_FORMAT })],
            validator: front.materialEditValidation.minStock, field: 'minStock', value, valid });
    });

    it.each([[id, true], [id.toUpperCase(), true], ['', false], [undefined, false], ['supplier-1', false], [[id], false], [{ id }, false]])(
        'UUID de un select %j: válido=%s', async (value, valid) => agrees({
            rules: [fields.validateUUID('supplierId')], validator: front.materialEditValidation.supplierId,
            field: 'supplierId', value, valid
        })
    );

    it.each([[true, true], [false, true], ['true', true], ['false', true], [0, true], ['1', true],
        ['on', false], [undefined, false], [null, false], [['true'], false], [{}, false]])(
        'estado booleano %j: válido=%s', async (value, valid) => agrees({
            rules: [fields.validateBoolean('isActive')], validator: front.clientValidation.isActive,
            field: 'isActive', value, valid
        })
    );

    it.each([['Persona válida', true], ['P'.repeat(101), true], ['P'.repeat(255), true], ['P'.repeat(256), false],
        [123, false], [['Persona'], false], ['  Persona válida  ', true], ['Persona <script>', false]])(
        'nombre de persona %j: válido=%s', async (value, valid) => agrees({ rules: personValidation,
            validator: front.personValidation.fullName, field: 'fullName', value, valid, data: { accesses: [access] } })
    );

    it.each([['C'.repeat(255), true], ['🙂'.repeat(255), true], ['C'.repeat(256), false], [123, false], [['Cliente'], false]])(
        'nombre de cliente %j: válido=%s', async (value, valid) => agrees({ rules: clientValidation,
            validator: front.clientValidation.name, field: 'name', value, valid, data: { isActive: true } })
    );

    it.each([['PVC / Lona_3 (1.5)', true], ['Recorte <script>', false]])(
        'nombre descriptivo de merma %j: válido=%s', async (value, valid) => agrees({ rules: wasteEditValidation,
            validator: front.wasteEditValidation.name, field: 'name', value, valid,
            data: { isActive: true, maxUnitCost: 0, expectedVersion: 0 } })
    );

    it.each([[undefined, true], [null, true], ['', true], ['   ', true], ['O'.repeat(500), true], ['O'.repeat(501), false],
        [false, false], [0, false], [['Nota'], false], ['Nota <script>', false],
        ['Nota\u0000oculta', false], ['Nota\u001Boculta', false], ['Nota\u007Foculta', false],
        ['Línea 1\nLínea 2\tcon tabulación', true], ["Nota de O'Brien & hijos", true]])(
        'observaciones opcionales %j: válido=%s', async (value, valid) => agrees({
            rules: [fields.validateTextOptional({ fieldName: 'observations', maxLength: 500 })],
            validator: front.issueReturnValidation.observations, field: 'observations', value, valid
        })
    );

    it.each([['2024-02-29T12:30:00.000Z', true], ['2026-02-28T12:30:00-06:00', true], ['2026-02-28', true],
        ['2026-02-30T12:00:00Z', false], ['2025-02-29T12:00:00Z', false], ['2026-02-28T24:00:00Z', false],
        [['2026-02-28'], false], [true, false]])('fecha %j: válida=%s', async (value, valid) => agrees({
        rules: [fields.validateDate('requestDate')], validator: front.issueHeaderValidation.requestDate,
        field: 'requestDate', value, valid
    }));

    it.each([[[access], true], [[], false], [[null], false], [['invalid'], false],
        [[{ departmentId: id }], false], [[{ ...access, roleId: [otherId] }], false],
        [[access, { ...access, departmentId: id.toUpperCase() }], false]])('accesos %j: válidos=%s', async (value, valid) => agrees({
        rules: personValidation, validator: front.personValidation.accesses, field: 'accesses', value, valid,
        data: { fullName: 'Persona válida' }
    }));

    it.each([[1, true], [0.5, false], ['99999999.99', true], ['1.001', false], [true, false], [[2], false]])(
        'cantidad de partida %j: válida=%s', async (quantity, valid) => {
            const value = [{ materialId: id, quantity, costPerUnitType: 2 }];
            await agrees({ rules: goodsReceiptValidation, validator: front.goodsReceiptValidation.details,
                field: 'details', value, valid, data: { supplierId: id, receivedById: id, isInvoiced: false,
                    receptionDate: '2026-10-19T12:00:00Z' } });
            expect(!front.addGoodsReceiptMaterialValidation.quantity(quantity)).toBe(valid);
            expect(!front.addGoodsIssueMaterialValidation.quantity(quantity)).toBe(valid);
        }
    );

    it.each([[0, false], ['0.01', true], ['', false], [undefined, false], ['1.001', false], [1, true]])(
        'cantidad de proyecto %j: válida=%s', async (projectConvertedQuantity, valid) => {
            const details = [{ id, projectConvertedQuantity, isSupplied: true }];
            expect((await run([fields.validateIssueProjectQuantityDetailsEdition], { details })).length === 0).toBe(valid);
            expect(!hasValidationErrors(validateDetailsFields(front.issueProjectQuantityDetailsValidation, details))).toBe(valid);
        }
    );

    it.each([[0, true], ['0.000001', true], ['12.123456', true], ['1.1234567', false], [false, false]])(
        'el costo máximo %j conserva su precisión monetaria y permite cero: válido=%s', async (value, valid) => agrees({
            rules: wasteEditValidation, validator: front.wasteEditValidation.maxUnitCost,
            field: 'maxUnitCost', value, valid, data: { name: 'Recorte', isActive: true, expectedVersion: 0 }
        })
    );

    it('catálogos validan símbolo y estado requeridos antes del envío', () => {
        const validators = front.createCatalogValidation({ entityLabel: 'unidad', nameMaxLength: 20, symbolMaxLength: 10 });
        expect(hasValidationErrors(validateFields(validators, { name: 'Metro', isActive: true }))).toBe(true);
        expect(hasValidationErrors(validateFields(validators, { name: 'Metro', symbol: 'm', isActive: false }))).toBe(false);
    });

    it.each([false, true])('la condición %s controla las reglas comunes antes de validar o normalizar', async enabled => {
        const condition = (_, { req }) => req.body.enabled;
        const data = { enabled, name: ['Nombre'], observations: ['Nota'], isActive: ['true'], newStock: [2] };
        const errors = await run([
            fields.validateText({ fieldName: 'name', maxLength: 50, condition }),
            fields.validateTextOptional({ fieldName: 'observations', maxLength: 500, condition }),
            fields.validateBoolean('isActive', { condition }),
            fields.validateNumber('newStock', { condition })
        ], data);

        expect(errors.map(({ path, msg }) => ({ path, msg }))).toEqual(enabled ? [
            { path: 'name', msg: 'NAME_INVALID_TYPE' },
            { path: 'observations', msg: 'OBSERVATIONS_INVALID_TYPE' },
            { path: 'isActive', msg: 'ACTIVE_INVALID_BOOLEAN' },
            { path: 'newStock', msg: 'NEW_STOCK_INVALID_NUMBER' }
        ] : []);
    });

    it.each([[undefined, ''], [null, ''], ['', ''], ['   ', ''], [' Nota ', 'Nota']])(
        'el texto opcional %j conserva la normalización esperada por los DTOs', async (value, expected) => {
            const req = { body: { observations: value } };
            await fields.validateTextOptional({ fieldName: 'observations', maxLength: 500 }).run(req);
            expect(validationResult(req).array()).toEqual([]);
            expect(req.body.observations).toBe(expected);
        }
    );
});
