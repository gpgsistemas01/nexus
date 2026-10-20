import { describe, expect, it } from 'vitest';
import { calculateGoodsReceiptDetailAmounts } from '../../../../src/shared/inventory/goodsReceiptCalculations.js';

describe('importes compartidos de compras', () => {
    it('calcula el área, el costo convertido y el IVA de una presentación con medidas', () => {
        expect(calculateGoodsReceiptDetailAmounts({ quantity: 2, costPerUnitType: 10, base: 1.5, height: 2 })).toEqual({
            quantity: 2, costPerUnitType: 10, convertedQuantity: 6,
            conversionUnitCost: 3.333333, netPurchaseAmount: 20, grossPurchaseAmount: 23.2
        });
    });

    it('conserva cantidad y costo de piezas sin medidas', () => {
        expect(calculateGoodsReceiptDetailAmounts({ quantity: 2, costPerUnitType: 1.123456, base: null, height: null })).toMatchObject({
            convertedQuantity: 2, conversionUnitCost: 1.123456,
            netPurchaseAmount: 2.246912, grossPurchaseAmount: 2.606418
        });
    });

    it.each([[0.01, 0], [0.02, 0.000002]])('normaliza la conversión en la frontera histórica con base %s', (base, convertedQuantity) => {
        expect(calculateGoodsReceiptDetailAmounts({ quantity: 1, costPerUnitType: 1, base, height: 0.0001 }).convertedQuantity).toBe(convertedQuantity);
    });
});
