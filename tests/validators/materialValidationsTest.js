import { validationResult } from 'express-validator';
import { describe, expect, it } from 'vitest';

import { materialValidation } from '../../src/validators/forms/materialValidations.js';

const validMaterialBody = {
  name: 'Material prueba',
  supplierId: '550e8400-e29b-41d4-a716-446655440000',
  presentationId: '550e8400-e29b-41d4-a716-446655440001',
  unitMeasureId: '550e8400-e29b-41d4-a716-446655440002',
  maxUnitCost: '1',
  isActive: true
};

const validateMaterial = async (body) => {
  const req = { body: { ...validMaterialBody, ...body } };

  await Promise.all(materialValidation.map((validation) => validation.run(req)));

  return validationResult(req).array().map(({ path, msg }) => ({ path, msg }));
};

describe('materialValidations', () => {
  it('rechaza medidas de material iguales a cero cuando se capturan', async () => {
    const errors = await validateMaterial({ base: '0', height: '0' });

    expect(errors).toEqual(expect.arrayContaining([
      { path: 'base', msg: 'BASE_INVALID_NUMBER' },
      { path: 'height', msg: 'HEIGHT_INVALID_NUMBER' }
    ]));
  });

  it('acepta medidas de material vacías o mayores a cero', async () => {
    await expect(validateMaterial({ base: '', height: '' })).resolves.toEqual([]);
    await expect(validateMaterial({ base: '0.01', height: '1' })).resolves.toEqual([]);
  });
});
