import { describe, expect, it } from 'vitest';
import { validationResult } from 'express-validator';

import { materialStockValidation, materialValidation } from '../../../src/validators/forms/materialValidations.js';

const validMaterial = {
  name: 'Lámina',
  supplierId: '11111111-1111-4111-8111-111111111111',
  presentationId: '22222222-2222-4222-8222-222222222222',
  unitMeasureId: '33333333-3333-4333-8333-333333333333',
  isActive: true
};

const runValidation = async (body, validation = materialValidation) => {
  const req = { body };
  await Promise.all(validation.map(rule => rule.run(req)));
  return validationResult(req).array();
};

describe('materialValidation', () => {
  it('no valida costo máximo ni stock nuevo en el contexto de una compra', async () => {
    const errors = await runValidation({
      ...validMaterial,
      creationContext: 'goodsReceipt',
      maxUnitCost: 'valor-ignorado',
      newStock: 'valor-ignorado'
    });

    expect(errors).toEqual([]);
  });

  it('mantiene obligatorios costo máximo y stock nuevo en el alta directa', async () => {
    const errors = await runValidation(validMaterial);

    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'maxUnitCost', msg: 'MAX_UNIT_COST_REQUIRED' }),
      expect.objectContaining({ path: 'newStock', msg: 'NEW_STOCK_REQUIRED' })
    ]));
  });

  it('rechaza un ajuste de material sin proveedor', async () => {
    const errors = await runValidation({
      newStock: 10,
      reasonId: '44444444-4444-4444-8444-444444444444'
    }, materialStockValidation);

    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'supplierId', msg: 'SUPPLIER_ID_REQUIRED' })
    ]));
  });
});
