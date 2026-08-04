import { validationResult } from 'express-validator';
import { describe, expect, it } from 'vitest';

import { wasteUpdateValidation } from '../../src/validators/forms/wasteValidations.js';

const validSupplierMaterialId = '550e8400-e29b-41d4-a716-446655440000';

const validateWasteUpdate = async (body) => {
  const req = { body };

  await Promise.all(wasteUpdateValidation.map((validation) => validation.run(req)));

  return validationResult(req).array().map(({ path, msg }) => ({ path, msg }));
};

describe('wasteValidations', () => {
  it('rechaza medidas de merma iguales a cero', async () => {
    const errors = await validateWasteUpdate({
      supplierMaterialId: validSupplierMaterialId,
      base: '0',
      height: '0'
    });

    expect(errors).toEqual(expect.arrayContaining([
      { path: 'base', msg: 'BASE_INVALID_NUMBER' },
      { path: 'height', msg: 'HEIGHT_INVALID_NUMBER' }
    ]));
  });

  it('acepta medidas de merma vacías o mayores a cero', async () => {
    await expect(validateWasteUpdate({
      supplierMaterialId: validSupplierMaterialId,
      base: '',
      height: ''
    })).resolves.toEqual([]);

    await expect(validateWasteUpdate({
      supplierMaterialId: validSupplierMaterialId,
      base: '0.01',
      height: '1'
    })).resolves.toEqual([]);
  });
});
