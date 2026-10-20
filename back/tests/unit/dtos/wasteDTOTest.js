import { describe, expect, it } from 'vitest';

import {
  createWasteDtoForEdit,
  createWasteDtoForRegister,
  createWasteDtoForStockAddition,
  createWasteDtoForStockAdjustment
} from '../../../src/dtos/wasteDTO.js';

describe('wasteDTO', () => {
  it('trata el nombre como identidad editable y no como dato secundario', () => {
    expect(createWasteDtoForEdit({
      name: '  Recorte corregido  ',
      minStock: 2,
      maxUnitCost: 15.5,
      isActive: true,
      weightKg: 9,
      coneWeightKg: 1,
      totalWeightKg: 10
    })).toEqual({
      name: 'Recorte corregido',
      minStock: 2,
      maxUnitCost: 15.5,
      isActive: true
    });
  });

  it('incluye y normaliza el nombre confirmado al registrar', () => {
    expect(createWasteDtoForRegister({
      name: '  Recorte confirmado  ',
      materialId: 'material-1',
      supplierId: 'supplier-1',
      base: 2,
      height: 3,
      minStock: 1,
      maxUnitCost: 10,
      isActive: true,
      initialQuantity: 4,
      coneWeightKg: 0.25,
      totalWeightKg: 1.5,
      referenceRollTotalWeightKg: 2.25,
      sampleLengthM: '999',
      sampleNetWeightKg: '999',
      weightKg: '999',
      newStock: 999,
      quantity: 999,
      reasonId: 'reason-1'
    })).toEqual({
      name: 'Recorte confirmado', materialId: 'material-1', supplierId: 'supplier-1',
      base: 2, height: 3, minStock: 1, maxUnitCost: 10, isActive: true, initialQuantity: 4,
      coneWeightKg: 0.25, totalWeightKg: 1.5, referenceRollTotalWeightKg: 2.25
    });
  });

  it('normaliza las observaciones igual en ajustes y adiciones de stock', () => {
    expect(createWasteDtoForStockAdjustment({
      newStock: 8,
      reasonId: 'reason-1',
      observations: '  Conteo físico  '
    })).toEqual({
      newStock: 8,
      reasonId: 'reason-1',
      observations: 'Conteo físico'
    });
    expect(createWasteDtoForStockAddition({
      quantity: 3,
      observations: '  Recepción adicional  '
    })).toEqual({
      quantity: 3,
      observations: 'Recepción adicional'
    });
  });
});
