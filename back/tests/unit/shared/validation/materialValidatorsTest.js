import { describe, expect, it } from 'vitest';

import {
  goodsReceiptMaterialCreateValidation,
  materialCreateValidation,
  materialEditValidation,
  materialStockValidation,
  materialValidation
} from '../../../../src/shared/validation/validators.js';

describe('validadores del CRUD de materiales', () => {
  it('compone edición y alta reutilizando las reglas comunes', () => {
    expect(Object.keys(materialEditValidation)).toEqual([
      'name',
      'supplierId',
      'minStock',
      'isActive',
      'maxUnitCost'
    ]);
    expect(materialCreateValidation).toMatchObject(materialValidation);
    expect(materialCreateValidation.newStock).toBe(materialStockValidation.newStock);
    expect(materialCreateValidation.observations).toBe(materialStockValidation.observations);
    expect(materialStockValidation.supplierId).toBe(materialEditValidation.supplierId);
  });

  it('acepta costo cero en alta y exige costo positivo en edición', () => {
    expect(materialCreateValidation.maxUnitCost(0)).toBeNull();
    expect(materialEditValidation.maxUnitCost(0)).toEqual(expect.any(String));
    expect(materialEditValidation.maxUnitCost('0.000001')).toBeNull();
  });

  it('requiere el proveedor asociado al ajustar el stock de un material', () => {
    expect(materialStockValidation.supplierId('')).toEqual(expect.any(String));
    expect(materialStockValidation.supplierId('11111111-1111-4111-8111-111111111111')).toBeNull();
  });

  it('el alta desde una compra valida sólo los datos de identidad y proveedor', () => {
    expect(goodsReceiptMaterialCreateValidation).toMatchObject({
      name: materialValidation.name,
      supplierId: materialValidation.supplierId,
      base: materialValidation.base,
      height: materialValidation.height
    });
    expect(goodsReceiptMaterialCreateValidation).not.toHaveProperty('minStock');
    expect(goodsReceiptMaterialCreateValidation).not.toHaveProperty('maxUnitCost');
  });
});
