import { describe, expect, it } from 'vitest';
import { buildStockUpdateSummary } from '../../src/services/inventory/movementHelpers.js';

describe('movementHelpers', () => {

  it('prepara resumen agrupado para actualizar stock sin fusionar detalles de movimiento', () => {
    const summary = buildStockUpdateSummary({
      details: [
        { current: { productId: 'product-1', supplierId: 'supplier-1' }, quantityToSupply: '1.505' },
        { current: { productId: 'product-1', supplierId: 'supplier-1' }, quantityToSupply: 2 },
        { current: { productId: 'product-2', supplierId: 'supplier-1' }, quantityToSupply: 1 }
      ],
      productId: ({ current }) => current.productId,
      supplierId: ({ current }) => current.supplierId,
      quantity: 'quantityToSupply'
    });

    expect([...summary.stockKeys]).toEqual([
      'product-1:supplier-1',
      'product-2:supplier-1'
    ]);
    expect([...summary.grouped.entries()]).toEqual([
      ['product-1:supplier-1', 3.51],
      ['product-2:supplier-1', 1]
    ]);
  });
});
