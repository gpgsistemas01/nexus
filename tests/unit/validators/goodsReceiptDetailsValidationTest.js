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
    [{ quantity: 1, costPerUnitType: 10 }],
    [{ materialId: 'material-1', quantity: 0, costPerUnitType: 10 }],
    [{ materialId: 'material-1', quantity: 1, costPerUnitType: 0 }]
  ])('rechaza con ambos contratos detalles incompletos o fuera de rango', async details => {
    await expect(runDetailsValidation(goodsReceiptValidation, details)).resolves.not.toEqual([]);
    await expect(runDetailsValidation(goodsReceiptHeaderValidation, details)).resolves.not.toEqual([]);
  });
});
