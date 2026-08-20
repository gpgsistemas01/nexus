import { describe, expect, it } from 'vitest';
import { buildStockUpdateSummary } from '../../src/services/inventory/movementHelpers.js';

describe('movementHelpers', () => {

  it('prepara resumen agrupado para actualizar stock sin fusionar detalles de movimiento', () => {
    const summary = buildStockUpdateSummary({
      details: [
        { current: { materialId: 'material-1', supplierId: 'supplier-1' }, quantityToSupply: '1.505' },
        { current: { materialId: 'material-1', supplierId: 'supplier-1' }, quantityToSupply: 2 },
        { current: { materialId: 'material-2', supplierId: 'supplier-1' }, quantityToSupply: 1 }
      ],
      materialId: ({ current }) => current.materialId,
      supplierId: ({ current }) => current.supplierId,
      quantity: 'quantityToSupply'
    });

    expect([...summary.stockKeys]).toEqual([
      'material-1:supplier-1',
      'material-2:supplier-1'
    ]);
    expect([...summary.grouped.entries()]).toEqual([
      ['material-1:supplier-1', 3.505],
      ['material-2:supplier-1', 1]
    ]);
  });
});
