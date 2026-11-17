import { describe, expect, it } from 'vitest';
import { getPerPieceMeasureError } from '../../../../src/shared/inventory/wasteMeasurements.js';
import { calculateGoodsReceiptDetailAmounts } from '../../../../src/shared/inventory/goodsReceiptCalculations.js';

describe('medida por pieza', () => {
    it.each([{ name: 'KILOGRAMO', symbol: 'kg' }, { name: 'METRO LINEAL', symbol: 'm' }])('valida el factor y convierte piezas con %j', unit => {
        expect(getPerPieceMeasureError(unit, { base: 1, height: 2.5 })).toBeNull();
        for (const measurements of [{ base: 2, height: 2.5 }, { base: 1, height: 0 }, {}]) {
            expect(getPerPieceMeasureError(unit, measurements)).toBeTruthy();
        }
        expect(calculateGoodsReceiptDetailAmounts({ quantity: 4, costPerUnitType: 20, base: 1, height: 2.5 })).toMatchObject({ convertedQuantity: 10, conversionUnitCost: 8 });
    });
});
