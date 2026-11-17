import { describe, expect, it } from 'vitest';
import { getPerPieceMeasureError, getConsumableUnitError } from '../../../../src/shared/inventory/wasteMeasurements.js';
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

it.each([{ name: 'KILOGRAMO', symbol: 'kg', presentation: 'KILOGRAMOS' }, { name: 'METRO LINEAL', symbol: 'm', presentation: 'METRO LINEAL' }])('consumible en $name conserva unidad 1 × 1 y cobra cantidad comprada', unit => {
    expect(getConsumableUnitError(unit, { base: 1, height: 1 }, { name: unit.presentation })).toBeNull();
    expect(getConsumableUnitError(unit, { base: 1, height: 2 }, { name: unit.presentation })).toBeTruthy();
    expect(getConsumableUnitError(unit, { base: 1, height: 1 }, { name: 'CAJA' })).toBeTruthy();
    const amounts = [1, 2.5].map(height => calculateGoodsReceiptDetailAmounts({ quantity: 4, costPerUnitType: 20, base: 1, height }));
    expect(amounts.map(value => value.netPurchaseAmount)).toEqual([80, 80]);
    expect(amounts.map(value => value.grossPurchaseAmount)).toEqual([92.8, 92.8]);
    expect(amounts.map(value => value.convertedQuantity)).toEqual([4, 10]);
});
