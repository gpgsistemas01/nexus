import { describe, expect, it } from 'vitest';

import {
  goodsReceiptEditValidation,
  goodsReceiptValidation
} from '../../../../../../src/public/js/utils/validations/validators.js';

describe('validadores del CRUD de entradas de compra', () => {
  it('compone la edición con el encabezado del alta sin permitir cambiar proveedor', () => {
    expect(goodsReceiptEditValidation).not.toHaveProperty('supplierId');

    for (const field of ['receivedById', 'observations', 'receptionDate', 'invoice']) {
      expect(goodsReceiptEditValidation[field]).toBe(goodsReceiptValidation[field]);
    }
  });

  it.each([
    ['alta sin detalles', goodsReceiptValidation, [], expect.any(String)],
    ['edición sin detalles nuevos', goodsReceiptEditValidation, [], null]
  ])('%s aplica la regla de detalles correspondiente', (_, validation, details, expected) => {
    expect(validation.details(details)).toEqual(expected);
  });

  it.each([
    ['sin factura', false, '', null],
    ['facturada sin número', true, '', expect.any(String)],
    ['factura válida', true, 'FAC-123', null],
    ['formato inválido', true, 'FAC_123', expect.any(String)],
    ['primer valor sobre el límite', true, 'A'.repeat(51), expect.any(String)]
  ])('%s valida la factura según el contexto', (_, isInvoiced, invoice, expected) => {
    expect(goodsReceiptValidation.invoice(invoice, { isInvoiced })).toEqual(expected);
  });
});
