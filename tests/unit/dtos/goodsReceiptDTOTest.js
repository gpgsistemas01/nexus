import { describe, expect, it } from 'vitest';

import {
  createGoodsReceiptDtoForEdit,
  createGoodsReceiptDtoForRegister
} from '../../../src/dtos/goodsReceiptDTO.js';

describe('goodsReceiptDTO', () => {
  it('normaliza la factura al crear y editar para comparar duplicados', () => {
    const common = {
      receivedById: ' person-1 ',
      isInvoiced: true,
      invoice: ' fac-001 ',
      receptionDate: '2026-08-06',
      details: []
    };

    expect(createGoodsReceiptDtoForRegister({ ...common, supplierId: ' supplier-1 ' }).invoice).toBe('FAC-001');
    expect(createGoodsReceiptDtoForEdit(common).invoice).toBe('FAC-001');
  });
});
