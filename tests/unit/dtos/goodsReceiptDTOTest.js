import { describe, expect, it } from 'vitest';

import {
  createGoodsReceiptDtoForEdit,
  createGoodsReceiptDtoForRegister
} from '../../../src/dtos/goodsReceiptDTO.js';

describe('goodsReceiptDTO', () => {
  it('normaliza la factura al crear y editar para comparar duplicados', () => {
    const common = {
      supplierId: ' supplier-1 ',
      receivedById: ' person-1 ',
      isInvoiced: true,
      invoice: ' fac-001 ',
      receptionDate: '2026-08-06',
      details: []
    };

    expect(createGoodsReceiptDtoForRegister(common).invoice).toBe('FAC-001');
    expect(createGoodsReceiptDtoForEdit(common).invoice).toBe('FAC-001');
  });

  it('conserva identidades para que el servicio descarte defensivamente filas existentes', () => {
    expect(createGoodsReceiptDtoForEdit({
      supplierId: ' supplier-1 ',
      receivedById: ' person-1 ',
      isInvoiced: false,
      receptionDate: '2026-08-27',
      details: [
        { id: ' detail-1 ', materialId: ' material-1 ', quantity: '2', costPerUnitType: '10' },
        { materialId: ' material-2 ', quantity: '3', costPerUnitType: '20' }
      ]
    })).toEqual(expect.objectContaining({
      supplierId: 'supplier-1',
      details: [
        { id: 'detail-1', materialId: 'material-1', quantity: 2, costPerUnitType: 10 },
        { materialId: 'material-2', quantity: 3, costPerUnitType: 20 }
      ]
    }));
  });

  it('conserva partidas repetidas del mismo material con precios diferentes al editar', () => {
    const dto = createGoodsReceiptDtoForEdit({
      supplierId: 'supplier-1',
      receivedById: 'person-1',
      isInvoiced: false,
      receptionDate: '2026-08-28',
      details: [
        { materialId: 'material-1', quantity: '2', costPerUnitType: '10' },
        { materialId: 'material-1', quantity: '3', costPerUnitType: '12.50' }
      ]
    });

    expect(dto.details).toEqual([
      { materialId: 'material-1', quantity: 2, costPerUnitType: 10 },
      { materialId: 'material-1', quantity: 3, costPerUnitType: 12.5 }
    ]);
  });
});
