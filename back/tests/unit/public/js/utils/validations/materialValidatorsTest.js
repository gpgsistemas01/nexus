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
    expect(materialStockValidation.supplierId).toBe(materialEditValidation.supplierId);
  });

  it('requiere el proveedor asociado al ajustar el stock de un material', () => {
    expect(materialStockValidation.supplierId('')).toEqual(expect.any(String));
    expect(materialStockValidation.supplierId('11111111-1111-4111-8111-111111111111')).toBeNull();
  });

  it.each([
    ['alta normal', materialCreateValidation, '', expect.any(String)],
    ['alta desde entrada', goodsReceiptMaterialCreateValidation, '', null],
    ['alta desde entrada con costo', goodsReceiptMaterialCreateValidation, '12.50', null],
    ['alta desde entrada con costo cero', goodsReceiptMaterialCreateValidation, 0, null],
    ['alta desde entrada con tipo inválido', goodsReceiptMaterialCreateValidation, false, expect.any(String)],
    ['alta desde entrada con array', goodsReceiptMaterialCreateValidation, [2], expect.any(String)]
  ])('%s decide si el costo máximo es obligatorio', (_, validation, value, expected) => {
    expect(validation.maxUnitCost(value)).toEqual(expected);
  });
});
