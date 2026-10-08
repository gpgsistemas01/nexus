import { describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();
const patch = vi.fn();
const authorizeUserApi = vi.fn(permission => `authorize:${permission}`);
const verifyApiTokenRequired = vi.fn();
const validate = vi.fn();
const handlers = vi.hoisted(() => Object.fromEntries(['Material', 'Consumable'].flatMap(label => [
    `getAll${label}GoodsReceipts`, `register${label}GoodsReceipt`, `edit${label}GoodsReceipt`,
    `correct${label}GoodsReceiptDetail`, `cancel${label}GoodsReceiptDetail`
].map(name => [name, vi.fn()]))));

vi.mock('express', () => ({ default: { Router: () => ({ get, post, patch }) } }));
vi.mock('../../../../../../src/middleware/authMiddleware.js', () => ({ authorizeUserApi, verifyApiTokenRequired }));
vi.mock('../../../../../../src/middleware/validatorMiddleware.js', () => ({ validate }));
vi.mock('../../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js', () => handlers);
vi.mock('../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js', () => handlers);

const validators = await import('../../../../../../src/validators/forms/goodsReceiptValidations.js');
await import('../../../../../../src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js');
await import('../../../../../../src/routes/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptApiRoute.js');
const { PERMISSIONS } = await import('../../../../../../src/constants/permissions.js');

describe('rutas de compra separadas por contexto', () => {
    it.each([['materials', 'Material'], ['consumables', 'Consumable']])('registra el flujo completo de %s con permisos y validadores', (path, label) => {
        const manage = `authorize:${PERMISSIONS.GOODS_RECEIPTS_MANAGE}`;
        expect(get).toHaveBeenCalledWith('/', verifyApiTokenRequired, manage, handlers[`getAll${label}GoodsReceipts`]);
        expect(post).toHaveBeenCalledWith('/', verifyApiTokenRequired, validators.goodsReceiptValidation, validate, manage, handlers[`register${label}GoodsReceipt`]);
        for (const [suffix, validation, permission, handler] of [
            ['', validators.goodsReceiptHeaderValidation, manage, `edit${label}GoodsReceipt`],
            ['/details/:detailId/corrections', validators.goodsReceiptCorrectionValidation, manage, `correct${label}GoodsReceiptDetail`]
        ]) {
            expect(patch).toHaveBeenCalledWith(`/:id${suffix}`, verifyApiTokenRequired, validation, validate, permission, handlers[handler]);
        }
        expect(patch).toHaveBeenCalledWith('/:id/details/:detailId/cancel', verifyApiTokenRequired, manage, handlers[`cancel${label}GoodsReceiptDetail`]);
    });
});
