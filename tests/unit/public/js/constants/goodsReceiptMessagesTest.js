import { describe, expect, it } from 'vitest';

import { GoodsReceiptInvoiceAlreadyExists } from '../../../../../src/errors/warehouse/goodsReceiptError.js';
import { getErrorMessage } from '../../../../../src/public/js/constants/apiMessages.js';

describe('mensajes del CRUD de entradas de compra', () => {
  it('muestra en frontend el mismo mensaje de factura duplicada enviado por backend', () => {
    const existingGoodsReceipt = {
      id: 'receipt-1',
      referenceNumber: 'COM-2026-0001'
    };
    const backendError = new GoodsReceiptInvoiceAlreadyExists(existingGoodsReceipt);

    expect(getErrorMessage({
      code: backendError.code,
      meta: backendError.meta
    })).toBe(backendError.message);
  });

  it('mantiene el mismo mensaje para el conflicto concurrente sin referencia', () => {
    const backendError = new GoodsReceiptInvoiceAlreadyExists();

    expect(getErrorMessage({ code: backendError.code })).toBe(backendError.message);
  });
});
