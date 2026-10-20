import { describe, expect, it } from 'vitest';
import { validationResult } from 'express-validator';

import { consumableValidation, materialEditValidation, materialStockValidation, materialValidation } from '../../../src/validators/forms/materialValidations.js';

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

  it('acepta el alta directa sin medidas y mantiene los códigos de error para una pareja incompleta', async () => {
    const body = { ...validMaterial, maxUnitCost: 10, newStock: 5 };
    expect(await runValidation({ ...body })).toEqual([]);
    expect(await runValidation({ ...body, base: 2 })).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'height', msg: 'HEIGHT_REQUIRED' })
    ]));
  });

  it('mantiene obligatorios costo máximo y stock nuevo en el alta directa', async () => {
    const errors = await runValidation(validMaterial);

    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'maxUnitCost', msg: 'MAX_UNIT_COST_REQUIRED' }),
      expect.objectContaining({ path: 'newStock', msg: 'NEW_STOCK_REQUIRED' })
    ]));
  });

  it.each([undefined, 'valor-ignorado'])('el contexto de compra no exime el costo %j al editar', async maxUnitCost => {
    const errors = await runValidation({ ...validMaterial, creationContext: 'goodsReceipt', maxUnitCost,
      expectedVersion: 0, expectedMaterialVersion: 0 }, materialEditValidation);

    expect(errors).toContainEqual(expect.objectContaining({ path: 'maxUnitCost',
      msg: maxUnitCost === undefined ? 'MAX_UNIT_COST_REQUIRED' : 'MAX_UNIT_COST_INVALID_NUMBER' }));
  });

  it.each([undefined, 'valor-ignorado'])('el contexto de compra no exime el stock %j al ajustar', async newStock => {
    const errors = await runValidation({ supplierId: validMaterial.supplierId, newStock,
      creationContext: 'goodsReceipt', reasonId: '44444444-4444-4444-8444-444444444444',
      expectedVersion: 0 }, materialStockValidation);

    expect(errors).toContainEqual(expect.objectContaining({ path: 'newStock',
      msg: newStock === undefined ? 'NEW_STOCK_REQUIRED' : 'NEW_STOCK_INVALID_NUMBER' }));
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


describe('consumibles y referencias históricas', () => {
  it.each([{ base: 2 }, { height: -1 }, { base: 'ignorado', height: 'ignorado' }])('no pide ni valida dimensiones de consumibles: %j', async dimensions => {
    const errors = await runValidation({ ...validMaterial, creationContext: 'goodsReceipt', ...dimensions }, consumableValidation);
    expect(errors).toEqual([]);
  });
  it.each(['referenceConeWeightKg', 'referenceRollTotalWeightKg'])('rechaza capturar o modificar %s con el código de error establecido', async field => {
    const errors = await runValidation({ ...validMaterial, creationContext: 'goodsReceipt', [field]: 1 });
    expect(errors).toContainEqual(expect.objectContaining({ path: field, msg: 'MATERIAL_ROLL_REFERENCE_READ_ONLY' }));
  });
});
