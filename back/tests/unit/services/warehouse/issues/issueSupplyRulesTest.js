import { describe, expect, it } from 'vitest';
import { resolveIssueSupplyChange } from '../../../../../src/services/warehouse/issues/issueSupplyRules.js';
import { resolveGoodsIssueDetailFulfillmentStatusName } from '../../../../../src/services/warehouse/goodsIssues/goodsIssueFulfillmentRules.js';

const current = { quantity: 2, convertedQuantity: 200, suppliedQuantity: null, isSupplied: false };
const requested = { isSupplied: true, projectConvertedQuantity: 250, quantityToSupply: 0.5, expectedSuppliedQuantity: 0 };

describe('surtido por entregas y cantidad de proyecto independiente', () => {
    it('descuenta sólo la entrega y conserva el proyecto y su diferencia negativa', () => {
        const change = resolveIssueSupplyChange({ current, requested });
        expect(change).toEqual({ quantityToSupply: 0.5, data: {
            suppliedQuantity: 0.5, isSupplied: false,
            projectConvertedQuantity: 250, convertedQuantityDifference: -50
        } });
        expect(resolveGoodsIssueDetailFulfillmentStatusName(change.data)).toBe('Surtido parcial');
        expect(current.suppliedQuantity).toBeNull();
    });

    it('acumula la última entrega y completa sólo al cubrir lo solicitado', () => {
        const change = resolveIssueSupplyChange({
            current: { ...current, suppliedQuantity: 1.5 },
            requested: { ...requested, expectedSuppliedQuantity: 1.5 }
        });
        expect(change.data).toMatchObject({ suppliedQuantity: 2, isSupplied: true, projectConvertedQuantity: 250 });
        expect(resolveGoodsIssueDetailFulfillmentStatusName(change.data)).toBe('Surtido');
    });

    it.each([0, -1, 2.01, NaN])('rechaza cantidad a surtir %s fuera del saldo', quantityToSupply => {
        expect(() => resolveIssueSupplyChange({ current, requested: { ...requested, quantityToSupply } }))
            .toThrow(expect.objectContaining({ code: 'ISSUE_SUPPLY_QUANTITY_CONFLICT' }));
    });

    it('rechaza la captura anterior antes de repetir una entrega parcial', () => {
        expect(() => resolveIssueSupplyChange({ current: { ...current, suppliedQuantity: 0.5 }, requested }))
            .toThrow(expect.objectContaining({ code: 'RECORD_VERSION_CONFLICT' }));
    });

    it('conserva la entrega del pendiente para clientes sin cantidad explícita', () => {
        expect(resolveIssueSupplyChange({
            current: { ...current, suppliedQuantity: 0.5 },
            requested: { isSupplied: true, projectConvertedQuantity: 250 }
        })).toMatchObject({ quantityToSupply: 1.5, data: { suppliedQuantity: 2, isSupplied: true } });
    });

    it('no genera entregas para detalles sin seleccionar ni completos de un cliente anterior', () => {
        expect(resolveIssueSupplyChange({ current, requested: { ...requested, isSupplied: false } })).toBeNull();
        expect(resolveIssueSupplyChange({
            current: { ...current, suppliedQuantity: 2, isSupplied: true },
            requested: { isSupplied: true, projectConvertedQuantity: 250 }
        })).toMatchObject({ quantityToSupply: 0 });
    });
});
