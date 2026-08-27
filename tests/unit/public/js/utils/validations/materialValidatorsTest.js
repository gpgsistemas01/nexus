import { describe, expect, it } from 'vitest';

import {
  goodsReceiptMaterialCreateValidation,
  materialCreateValidation,
  materialEditValidation,
  materialStockValidation,
  materialValidation
} from '../../../../../../src/public/js/utils/validations/validators.js';

describe('validadores del CRUD de materiales', () => {
  it('compone edición y alta reutilizando las reglas comunes', () => {
    expect(Object.keys(materialEditValidation)).toEqual([
      'name',
      'supplierId',
      'minStock',
      'isActive',
      'maxUnitCost'
    ]);
    expect(materialValidation).toMatchObject(materialEditValidation);
    expect(materialCreateValidation).toMatchObject(materialValidation);
    expect(materialCreateValidation.newStock).toBe(materialStockValidation.newStock);
    expect(materialCreateValidation.observations).toBe(materialStockValidation.observations);
  });

  it.each([
    ['alta normal', materialCreateValidation, '', expect.any(String)],
    ['alta desde entrada', goodsReceiptMaterialCreateValidation, '', null],
    ['alta desde entrada con costo', goodsReceiptMaterialCreateValidation, '12.50', null]
  ])('%s decide si el costo máximo es obligatorio', (_, validation, value, expected) => {
    expect(validation.maxUnitCost(value)).toEqual(expected);
  });
});
