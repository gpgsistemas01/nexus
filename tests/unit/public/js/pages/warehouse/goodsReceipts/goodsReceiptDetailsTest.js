import { describe, expect, it } from 'vitest';

import {
  buildGoodsReceiptModalDetails,
  calculateGoodsReceiptDetailAmounts,
  mapGoodsReceiptSelectionToDetail
} from '../../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptDetails.js';

describe('detalles del CRUD de entradas de compra', () => {
  it('mapea el contrato compartido del select a la fila y al request de compra', () => {
    const detail = mapGoodsReceiptSelectionToDetail({
      optionData: {
        material: JSON.stringify({
          id: 'material-1',
          name: 'Lámina',
          base: '2',
          height: '3',
          presentation: { name: 'ROLLO' },
          unitMeasure: { symbol: 'm²' }
        }),
        supplier: JSON.stringify({ id: 'supplier-1', tradeName: 'Proveedor Norte' })
      },
      quantity: '2',
      costPerUnitType: '100'
    });

    expect(detail).toEqual({
      materialId: 'material-1',
      name: 'Lámina (2 × 3) · Proveedor Norte',
      base: '2',
      height: '3',
      presentation: 'ROLLO',
      unitMeasure: 'm²',
      supplier: { id: 'supplier-1', tradeName: 'Proveedor Norte' },
      quantity: 2,
      costPerUnitType: 100,
      convertedQuantity: 12,
      conversionUnitCost: 16.666667,
      netPurchaseAmount: 200,
      grossPurchaseAmount: 232
    });
  });

  it('aplica la partición sin dimensiones reutilizada por altas y correcciones', () => {
    expect(calculateGoodsReceiptDetailAmounts({
      quantity: 4,
      costPerUnitType: 25,
      base: null,
      height: null
    })).toEqual({
      quantity: 4,
      costPerUnitType: 25,
      convertedQuantity: 4,
      conversionUnitCost: 25,
      netPurchaseAmount: 100,
      grossPurchaseAmount: 116
    });
  });

  it('normaliza la lectura del CRUD al mismo contrato de fila usado por salidas', () => {
    const [detail] = buildGoodsReceiptModalDetails({
      supplierName: 'Proveedor Norte',
      supplier: { id: 'supplier-1', tradeName: 'Proveedor Norte' },
      status: { name: 'Confirmada' },
      details: [{
        id: 'detail-1',
        goodsReceiptId: 'receipt-1',
        materialId: 'material-1',
        materialName: 'Lámina histórica',
        quantity: 2,
        status: 'ACTIVE',
        createdAt: '2026-08-20T12:00:00.000Z',
        updatedAt: '2026-08-20T13:00:00.000Z',
        material: {
          name: 'Lámina',
          base: 2,
          height: 3,
          presentation: { id: 'presentation-1', name: 'ROLLO' },
          unitMeasure: { id: 'unit-1', symbol: 'm²' }
        }
      }]
    });

    expect(detail).toEqual(expect.objectContaining({
      id: 'detail-1',
      goodsReceiptId: 'receipt-1',
      materialId: 'material-1',
      name: 'Lámina (2 × 3) · Proveedor Norte',
      base: 2,
      height: 3,
      presentation: 'ROLLO',
      unitMeasure: 'm²',
      supplier: { id: 'supplier-1', tradeName: 'Proveedor Norte' },
      status: 'ACTIVE',
      createdAt: '2026-08-20T12:00:00.000Z',
      updatedAt: '2026-08-20T13:00:00.000Z',
      presentationId: 'presentation-1',
      unitMeasureId: 'unit-1'
    }));
  });
});
