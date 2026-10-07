import { describe, expect, it, vi } from 'vitest';
vi.mock('../../../../../src/repository/baseRepository.js', () => ({ getDb: vi.fn() }));

import { buildGoodsReceiptContextWhere } from '../../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js';
import { GoodsReceiptNotFound } from '../../../../../src/errors/warehouse/goodsReceiptError.js';

describe('contexto de compras', () => {
    it.each(['MATERIAL', 'CONSUMABLE'])('exige cabecera y todos los detalles de %s', type => {
        expect(buildGoodsReceiptContextWhere(type)).toEqual({
            type, details: { some: {}, every: { material: { type } } }
        });
    });
    it('conserva las consultas comunes sin contexto', () => {
        expect(buildGoodsReceiptContextWhere()).toEqual({});
    });
    it('rechaza tipos no reconocidos', () => {
        expect(() => buildGoodsReceiptContextWhere('OTHER')).toThrow(GoodsReceiptNotFound);
    });
});
