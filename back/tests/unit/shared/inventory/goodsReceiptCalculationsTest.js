import { describe, expect, it } from 'vitest';
import { calculateGoodsReceiptDetailAmounts, usesAutomaticTotalCost } from '../../../../src/shared/inventory/goodsReceiptCalculations.js';

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

it.each([1, 2.5])('costo total divide por cantidad comprada aunque la medida sea %s', height => {
    expect(calculateGoodsReceiptDetailAmounts({ quantity: 10, costPerUnitType: 500, base: 1, height, costIsTotal: true })).toMatchObject({
        costIsTotal: true, conversionUnitCost: 50, netPurchaseAmount: 500, grossPurchaseAmount: 580,
        convertedQuantity: 10 * height
    });
});

it.each([
    ['KILOGRAMOS', 1, 1, true], ['KILOGRAMO', '1', '1', true],
    ['METRO LINEAL', 1, 1, true], ['METRO LINEAL', 1, 2, false],
    ['KILOGRAMOS', null, null, false], ['PIEZA', 1, 1, false], ['ROLLO', 1, 1, false]
])('costo total automático para %s con medidas %s × %s: %s', (name, base, height, expected) => {
    expect(usesAutomaticTotalCost({ presentation: { name }, base, height })).toBe(expected);
});
