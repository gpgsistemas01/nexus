import { describe, expect, it } from 'vitest';
import { validationResult } from 'express-validator';

import {
  goodsReceiptHeaderValidation,
  goodsReceiptValidation
} from '../../../src/validators/forms/goodsReceiptValidations.js';

const runDetailsValidation = async (rules, details) => {
  const req = { body: { details } };

  await rules.at(-1).run(req);

  return validationResult(req).array();
};

describe('validación de detalles de compra', () => {
  it('entrega números, booleanos y fecha tipados al controller, incluidos costos con seis decimales', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const req = { body: { supplierId: id, receivedById: id, isInvoiced: 'false',
      receptionDate: '2026-10-19T12:00:00.000Z', details: [{ materialId: id, quantity: '1.25', costPerUnitType: '12.123456' }] } };
    for (const rule of goodsReceiptValidation) await rule.run(req);

    expect(validationResult(req).array()).toEqual([]);
    expect(req.body.isInvoiced).toBe(false);
    expect(req.body.receptionDate).toEqual(new Date('2026-10-19T12:00:00.000Z'));
    expect(req.body.details).toEqual([{ materialId: id, quantity: 1.25, costPerUnitType: 12.123456 }]);
  });

  it('acepta los mismos detalles válidos en alta y edición de encabezado', async () => {
    const details = [{
      materialId: 'material-1',
      quantity: '2',
      costPerUnitType: '15.5'
    }];

    await expect(runDetailsValidation(goodsReceiptValidation, details)).resolves.toEqual([]);
    await expect(runDetailsValidation(goodsReceiptHeaderValidation, details)).resolves.toEqual([]);
  });

  it.each([
    [],
    'invalid',
    [null],
    [{ quantity: 1, costPerUnitType: 10 }],
    [{ materialId: 'material-1', quantity: 0, costPerUnitType: 10 }],
    [{ materialId: 'material-1', quantity: 1, costPerUnitType: 0 }]
  ])('rechaza con ambos contratos detalles incompletos o fuera de rango', async details => {
    await expect(runDetailsValidation(goodsReceiptValidation, details)).resolves.not.toEqual([]);
    await expect(runDetailsValidation(goodsReceiptHeaderValidation, details)).resolves.not.toEqual([]);
  });

  it('exige detalles en el alta y permite omitirlos al editar sólo el encabezado', async () => {
    expect(await runDetailsValidation(goodsReceiptValidation, undefined)).toContainEqual(
      expect.objectContaining({ path: 'details', msg: 'DETAILS_REQUIRED' })
    );
    expect(await runDetailsValidation(goodsReceiptHeaderValidation, undefined)).toEqual([]);
  });

  it.each([
    ['quantity', true, 'DETAILS_INVALID_FORMAT_QUANTITY'],
    ['quantity', [2], 'DETAILS_INVALID_FORMAT_QUANTITY'],
    ['quantity', { toString: null, valueOf: null }, 'DETAILS_INVALID_FORMAT_QUANTITY'],
    ['costPerUnitType', true, 'DETAILS_INVALID_FORMAT_COST_PER_UNIT_TYPE'],
    ['costPerUnitType', { toString: null, valueOf: null }, 'DETAILS_INVALID_FORMAT_COST_PER_UNIT_TYPE']
  ])('rechaza el tipo de %s con un código de errorMap: %s', async (field, value, code) => {
    const details = [{ materialId: 'material-1', quantity: 2, costPerUnitType: 10, [field]: value }];

    for (const rules of [goodsReceiptValidation, goodsReceiptHeaderValidation]) {
      expect(await runDetailsValidation(rules, details)).toContainEqual(expect.objectContaining({ path: 'details', msg: code }));
    }
  });
});
